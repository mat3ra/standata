from enum import Enum
from typing import Any, Dict, List, Optional

from mat3ra.esse.models.method.categorized_method import SlugifiedEntry

from .base import Standata, StandataData
from .data.model_tree import MODEL_NAMES, MODEL_TREE, model_tree_data
from .data.models_tree_config_by_application import models_tree_config_by_application


class ModelTreeStandata(Standata):
    data_dict: Dict = model_tree_data
    data: StandataData = StandataData(data_dict)

    def get_method_types_by_model(self, model_shortname: str, method_shortname: str) -> List[str]:
        model_tree = MODEL_TREE.get(model_shortname, {})
        methods_tree = model_tree.get("methods", {})
        method_info = methods_tree.get(method_shortname, {})
        return method_info.get("types", [])

    def tree_slug_to_named_object(self, slug: str) -> SlugifiedEntry:
        name = MODEL_NAMES.get(slug, slug)
        return SlugifiedEntry(slug=slug, name=name)

    def get_tree_by_application_name_and_version(self, name: str, version: str) -> Dict[str, Any]:
        # TODO: add logic to filter by version when necessary
        return models_tree_config_by_application.get(name, {})

    def get_default_model_type_for_application(self, application: Dict[str, Any]) -> Optional[str]:
        name = application.get("name")
        if not name:
            return None
        tree = self.get_tree_by_application_name_and_version(name, application.get("version", ""))
        keys = list(tree.keys())
        return keys[0] if keys else None

    @classmethod
    def get_subtypes_by_model_type(cls, model_type: str) -> type[Enum]:
        model_tree = MODEL_TREE.get(model_type, {})
        subtypes = list(model_tree.keys())
        return cls._create_enum_from_values(subtypes, f"{model_type.upper()}Subtypes")

    @classmethod
    def get_functionals_by_subtype(cls, model_type: str, subtype_enum: Enum) -> type[Enum]:
        model_tree = MODEL_TREE.get(model_type, {})
        subtype_value = subtype_enum.value if isinstance(subtype_enum, Enum) else subtype_enum
        subtype_tree = model_tree.get(subtype_value, {})
        functionals = subtype_tree.get("functionals", [])
        enum_name = f"{model_type.upper()}{cls._normalize_enum_name(subtype_value)}Functionals"
        return cls._create_enum_from_values(functionals, enum_name)

    @classmethod
    def get_default_subtype(cls, model_tree: Dict[str, Any]) -> Optional[str]:
        subtypes = [key for key in model_tree.keys() if key not in ["refiners", "modifiers", "methods"]]
        return subtypes[0] if subtypes else None

    @classmethod
    def get_model_by_parameters(cls, type: str, subtype: Optional[str], functional: Optional[str]) -> Dict[str, Any]:
        model_tree = MODEL_TREE.get(type, {})
        if not model_tree:
            return {}

        result = {"type": type}

        resolved_subtype = subtype or cls.get_default_subtype(model_tree)
        subtype_tree = model_tree.get(resolved_subtype, {}) if resolved_subtype else {}
        if not subtype_tree:
            return result

        result["subtype"] = resolved_subtype

        functionals_from_tree = subtype_tree.get("functionals", [])
        if functionals_from_tree:
            if functional and functional in functionals_from_tree:
                result["functional"] = functional
            else:
                result["functional"] = functionals_from_tree[0]

        return result
