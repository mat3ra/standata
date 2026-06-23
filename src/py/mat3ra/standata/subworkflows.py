from typing import Dict

from .base import StandataData
from .data.subworkflows import subworkflows_data
from .workflow.base import BaseWorkflowSubworkflowStandata


class SubworkflowStandata(BaseWorkflowSubworkflowStandata):
    data_dict: Dict = subworkflows_data
    data: StandataData = StandataData(data_dict)
