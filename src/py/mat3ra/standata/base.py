import re
from enum import Enum
from typing import Dict, List

import pandas as pd
from pydantic import BaseModel, Field

CATEGORY_SEPARATOR = "/"


class StandataEntity(BaseModel):
    filename: str
    categories: List[str]


class StandataConfig(BaseModel):
    categories: Dict[str, List[str]] = {}
    entities: List[StandataEntity] = []

    def get_categories_as_list(self, separator: str = CATEGORY_SEPARATOR) -> List[str]:
        """
        Flattens categories dictionary to list of categories.

        Args:
            separator: Separation character used to join category type and tag.

        Example::

            Standata.flatten_categories({"size": ["S", "M", "L"]})
            # returns ["size/S", "size/M", "size/L"]
        """
        category_groups = [list(map(lambda x: f"{key}{separator}{x}", val)) for key, val in self.categories.items()]
        return [item for sublist in category_groups for item in sublist]

    def convert_tags_to_categories_list(self, *tags: str):
        """
        Converts simple tags to '<category_type>/<tag>' format.

        Args:
            *tags: Category tags for the entity.

        Note:
            Some tags belong to several categories simultaneously, for instance 'semiconductor' is associated with
            'electrical_conductivity' and 'type'. This function returns all occurrences of a tag as
            '<category_type>/<tag>'.
        """
        return [
            cf for cf in self.get_categories_as_list() if any((cf.split(CATEGORY_SEPARATOR)[-1] == t) for t in tags)
        ]

    def get_filenames_by_categories(self, *categories: str) -> List[str]:
        """
        Returns filenames that match all given categories.

        Args:
            *categories: Categories for the entity query. Categories can be either in
                        'category/tag' format or just 'tag' format.

        Returns:
            List of filenames that match ALL given categories.
        """
        if len(categories) == 0:
            return []

        # Convert simple tags to full category format if needed
        full_categories = []
        for category in categories:
            if CATEGORY_SEPARATOR in category:
                full_categories.append(category)
            else:
                # Convert tag to full category format
                converted = self.convert_tags_to_categories_list(category)
                full_categories.extend(converted)

        if not full_categories:  # If no valid categories found
            return []

        filenames = []
        for entity in self.entities:
            # Convert entity categories to full format
            entity_categories = self.convert_tags_to_categories_list(*entity.categories)

            # Check if ALL required categories are present
            if all(category in entity_categories for category in full_categories):
                filenames.append(entity.filename)

        return filenames

    def get_filenames_by_regex(self, regex: str) -> List[str]:
        """
        Returns filenames that match the regular expression.

        Args:
            regex: Regular expression for the entity query.
        """
        filenames = []
        for entity in self.entities:
            if re.search(regex, entity.filename):
                filenames.append(entity.filename)
        return filenames

    # TODO: This is not used, but left in preparation for the future when the number of entities is large
    @property
    def __lookup_table(self) -> pd.DataFrame:
        """
        Creates lookup table for filenames and associated categories.

        For the lookup table category tags are first converted to the <category_type>/<tag> format, which represent the
        columns of the lookup table. The filenames represent the rows of the lookup table (DataFrame.index). The values
        in the table are either 0 or 1 depending on whether a filename is associated with a certain category (1) or
        not (0).
        """
        df = pd.DataFrame(
            0,
            columns=self.get_categories_as_list(),
            index=[entity.filename for entity in self.entities],
        )
        for entity in self.entities:
            filename = entity.filename
            categories = self.convert_tags_to_categories_list(*entity.categories)
            for category in categories:
                df.loc[filename, category] = 1
        return df


class StandataFilesMapByName(BaseModel):
    dictionary: Dict[str, dict] = Field(default_factory=dict)

    def get_objects_by_filenames(self, filenames: List[str]) -> List[dict]:
        """
        Returns entities by filenames.

        Args:
            filenames: Filenames of the entities.
        """
        matching_objects = []
        for key, entity in self.dictionary.items():
            if key in filenames:
                matching_objects.append(entity)
        return matching_objects


class StandataData(BaseModel):
    class Config:
        arbitrary_types_allowed = True

    filesMapByName: StandataFilesMapByName = StandataFilesMapByName()
    standataConfig: StandataConfig = StandataConfig()

    def __init__(self, data: Dict):
        """
        Initializes StandataData from raw data.
        Args:
            data: Dictionary with keys for filesMapByName and standataConfig.
        """
        super().__init__(filesMapByName=self._initialize_files_map(data), standataConfig=self._initialize_config(data))

    @staticmethod
    def _initialize_files_map(data: Dict) -> StandataFilesMapByName:
        """
        Initialize the StandataFilesMapByName from the input data.
        """
        files_map_dictionary = data.get("filesMapByName", {})
        return StandataFilesMapByName(dictionary=files_map_dictionary)

    @staticmethod
    def _initialize_config(data: Dict) -> StandataConfig:
        """
        Initialize StandataConfig from the input data.
        """
        config_data_dict = data.get("standataConfig", {})
        categories_dict = config_data_dict.get("categories", {})
        entites_dict = config_data_dict.get("entities", [])
        entites = [
            StandataEntity(filename=entity["filename"], categories=entity["categories"]) for entity in entites_dict
        ]
        return StandataConfig(
            categories=categories_dict,
            entities=entites,
        )


class Standata:
    data_dict: Dict = {}
    data: StandataData = StandataData(data_dict)

    @classmethod
    def get_as_list(cls) -> List[dict]:
        return list(cls.data.filesMapByName.dictionary.values())

    @classmethod
    def get_names(cls) -> List[str]:
        return list(cls.data.filesMapByName.dictionary.keys())

    @classmethod
    def get_by_name(cls, name: str) -> List[dict]:
        """
        Returns entities by name regex.

        Args:
            name: Name of the entity.
        """
        matching_filenames = cls.data.standataConfig.get_filenames_by_regex(name)
        return cls.data.filesMapByName.get_objects_by_filenames(matching_filenames)

    @classmethod
    def get_by_name_first_match(cls, name: str) -> dict:
        """
        Returns the first entity that matches the name regex.

        Args:
            name: Name of the entity.
        """
        matching_filenames = cls.data.standataConfig.get_filenames_by_regex(name)
        objects = cls.data.filesMapByName.get_objects_by_filenames(matching_filenames)
        if not objects:
            raise ValueError(f"No matches found for name '{name}'")
        return objects[0]
    
    @classmethod
    def get_by_categories(cls, *tags: str) -> List[dict]:
        """
        Finds entities that match all specified category tags.

        Args:
            *tags: Category tags for the entity query.
        """
        categories = cls.data.standataConfig.convert_tags_to_categories_list(*tags)
        matching_filenames = cls.data.standataConfig.get_filenames_by_categories(*categories)
        return cls.data.filesMapByName.get_objects_by_filenames(matching_filenames)

    @classmethod
    def get_by_name_and_categories(cls, name: str, *tags: str) -> dict:
        """
        Returns the first entity that matches both the name regex and all categories.

        Args:
            name: Name to match with regex
            *tags: Category tags to match

        Returns:
            First matching entity
        """
        categories = cls.data.standataConfig.convert_tags_to_categories_list(*tags)
        category_matches = cls.data.standataConfig.get_filenames_by_categories(*categories)
        name_matches = cls.data.standataConfig.get_filenames_by_regex(name)
        matching_filenames = [f for f in name_matches if f in category_matches]

        if not matching_filenames:
            raise ValueError(f"No matches found for name '{name}' and categories {tags}")

        return cls.data.filesMapByName.get_objects_by_filenames(matching_filenames)[0]

    @classmethod
    def _create_filtered_data(cls, filenames: List[str]) -> StandataData:
        filtered_files_map = {k: v for k, v in cls.data.filesMapByName.dictionary.items() if k in filenames}
        filtered_entities = [e for e in cls.data.standataConfig.entities if e.filename in filenames]
        return StandataData({
            "filesMapByName": filtered_files_map,
            "standataConfig": {
                "categories": cls.data.standataConfig.categories,
                "entities": [{"filename": e.filename, "categories": e.categories} for e in filtered_entities]
            }
        })

    @classmethod
    def _normalize_enum_name(cls, name: str) -> str:
        return name.upper().replace("-", "_")

    @classmethod
    def _create_enum_from_values(cls, values: List[str], enum_name: str) -> type[Enum]:
        enum_dict = {cls._normalize_enum_name(value): value for value in values}
        return Enum(enum_name, enum_dict)

    @classmethod
    def filter_by_name(cls, name: str) -> "Standata":
        matching_filenames = cls.data.standataConfig.get_filenames_by_regex(name)
        filtered_data = cls._create_filtered_data(matching_filenames)
        return type(cls.__name__, (cls,), {"data": filtered_data})

    @classmethod
    def filter_by_tags(cls, *tags: str) -> "Standata":
        categories = cls.data.standataConfig.convert_tags_to_categories_list(*tags)
        matching_filenames = cls.data.standataConfig.get_filenames_by_categories(*categories)
        filtered_data = cls._create_filtered_data(matching_filenames)
        return type(cls.__name__, (cls,), {"data": filtered_data})
