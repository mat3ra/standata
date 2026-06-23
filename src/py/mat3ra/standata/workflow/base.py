from types import SimpleNamespace
from typing import Dict, List

from mat3ra.standata.applications import ApplicationStandata
from mat3ra.standata.base import Standata

TAGS = SimpleNamespace(
    RELAXATION="variable-cell_relaxation",
    DEFAULT="default"
)


class BaseWorkflowSubworkflowStandata(Standata):
    @classmethod
    def filter_by_application(cls, application: str) -> "Standata":
        return cls.filter_by_tags(application)

    @classmethod
    def filter_by_application_config(cls, application_config: Dict) -> "Standata":
        application_name = application_config.get("name", "")
        return cls.filter_by_application(application_name)

    @classmethod
    def find_by_application(cls, app_name: str) -> List[Dict]:
        return cls.get_by_categories(app_name)

    @classmethod
    def find_by_application_and_name(cls, app_name: str, display_name: str) -> Dict:
        entities = cls.find_by_application(app_name)
        return next((e for e in entities if e.get("name") == display_name), None)

    @classmethod
    def get_default(cls) -> Dict:
        defaults = cls.get_by_categories(TAGS.DEFAULT)
        if not defaults:
            return {}
        return defaults[0]

    @classmethod
    def get_relaxation_by_application(cls, application: str) -> Dict:
        """
        Get relaxation entity for a specific application.

        Enriches the application field with full application data if available.
        """
        found_data = cls.get_by_categories(application, TAGS.RELAXATION)
        if not found_data:
            return {}

        relaxation_data = found_data[0].copy()

        full_app_data = ApplicationStandata.get_by_name_first_match(application)
        relaxation_data["application"] = full_app_data

        return relaxation_data
