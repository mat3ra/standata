from typing import Dict

from .base import StandataData
from .data.workflows import workflows_data
from .workflow.base import BaseWorkflowSubworkflowStandata


class WorkflowStandata(BaseWorkflowSubworkflowStandata):
    data_dict: Dict = workflows_data
    data: StandataData = StandataData(data_dict)


