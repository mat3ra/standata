import json

import pytest
import yaml

# Shared test data
SAMPLE_CONFIG = {
    "categories": {"dimensionality": ["2D", "3D"], "type": ["metal", "semiconductor"]},
    "entities": [
        {"filename": "material1.json", "categories": ["2D", "metal"]},
        {"filename": "material2.json", "categories": ["3D", "semiconductor"]},
    ],
}

SAMPLE_ENTITY = {"name": "Test Material", "isNonPeriodic": False, "lattice": {"a": 1.0, "b": 1.0, "c": 1.0}}


@pytest.fixture
def temp_dir(tmp_path):
    """Create a temporary directory with test files."""
    # Create config file
    config_path = tmp_path / "categories.yml"
    with open(config_path, "w") as f:
        yaml.dump(SAMPLE_CONFIG, f)

    # Create entity files
    for entity in SAMPLE_CONFIG["entities"]:
        entity_path = tmp_path / entity["filename"]
        with open(entity_path, "w") as f:
            json.dump(SAMPLE_ENTITY, f)

    return tmp_path


@pytest.fixture
def builder(temp_dir):
    """Create a StandataBuilder instance."""
    from mat3ra.standata.build.builder import StandataBuilder

    return StandataBuilder(temp_dir)
