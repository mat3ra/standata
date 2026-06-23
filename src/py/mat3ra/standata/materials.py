from typing import Dict

from .base import Standata, StandataData
from .data.materials import materials_data


class Materials(Standata):
    data_dict: Dict = materials_data
    data: StandataData = StandataData(data_dict)
