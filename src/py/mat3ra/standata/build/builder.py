from pathlib import Path
from typing import Optional, Union
import json
import yaml

from ..base import StandataConfig, StandataEntity


class StandataBuilder:
    """
    The StandataBuilder class is responsible for building the StandataConfig object.

    Attributes:
        entity_dir: Path to the folder containing entity data files.
    """

    def __init__(self, entity_dir: Union[str, Path]):
        """
        Initializes categories and the entity list.

        Args:
             entity_dir: The path to the directory containing all entities.
        """
        self.entity_dir: Path = Path(entity_dir).resolve()

    @classmethod
    def build_from_file(cls, entity_config_path: Union[Path, str]) -> StandataConfig:
        """
        Creates StandataConfig instance from entity config file (categories.yml).

        Args:
            entity_config_path: The path to the entity config file `categories.yml`.

        Note:
            Here, we assume that the entity config file is located in the same directory as all entity files.
        """
        filepath = Path(entity_config_path)
        return cls.load_config(filepath)

    @staticmethod
    def load_config(entity_config_path: Path) -> StandataConfig:
        """
        Loads entity config from file (Yaml).

        Args:
            entity_config_path: The path to the entity config file `categories.yml`.

        Returns:
            StandataConfig containing categories and entities configuration.
        """
        try:
            with open(entity_config_path.resolve(), "r") as stream:
                raw_config = yaml.safe_load(stream)
                return StandataConfig(
                    categories=raw_config.get("categories", {}),
                    entities=[
                        StandataEntity(filename=e["filename"], categories=e["categories"])
                        for e in raw_config.get("entities", [])
                    ],
                )
        except yaml.YAMLError as e:
            print(f"Error loading YAML config: {e}")
            return StandataConfig()

    @staticmethod
    def load_entity(filepath: Path) -> Optional[dict]:
        """
        Loads entity config from file (JSON).

        Args:
            filepath: Path to entity data file (JSON).

        Returns:
            Optional[dict]: The loaded entity data or None if loading fails.
        """
        if not filepath.resolve().exists():
            print(f"Could not find entity file: {filepath.resolve()}")
            return None

        try:
            with open(filepath.resolve(), "r") as f:
                entity = json.load(f)
                return entity
        except json.JSONDecodeError as e:
            print(f"Error loading JSON entity: {e}")
            return None
