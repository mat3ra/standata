from pathlib import Path

from mat3ra.standata.base import StandataConfig, StandataEntity
from mat3ra.standata.build.builder import StandataBuilder


def test_builder_initialization(builder):
    """Test StandataBuilder initialization."""
    assert isinstance(builder, StandataBuilder)
    assert isinstance(builder.entity_dir, Path)
    assert builder.entity_dir.exists()


def test_load_config(temp_dir):
    """Test loading configuration from YAML file."""
    config = StandataBuilder.load_config(temp_dir / "categories.yml")
    assert isinstance(config, StandataConfig)
    assert len(config.categories) == 2
    assert len(config.entities) == 2
    assert isinstance(config.entities[0], StandataEntity)
    assert "dimensionality" in config.categories
    assert "type" in config.categories


def test_load_entity(temp_dir):
    """Test loading entity from JSON file."""
    entity_data = StandataBuilder.load_entity(temp_dir / "material1.json")
    assert isinstance(entity_data, dict)
    assert entity_data["name"] == "Test Material"
    assert entity_data["isNonPeriodic"] is False


def test_load_nonexistent_entity(temp_dir):
    """Test loading non-existent entity file."""
    entity_data = StandataBuilder.load_entity(temp_dir / "nonexistent.json")
    assert entity_data is None


def test_build_from_file(temp_dir):
    """Test building StandataConfig from config file."""
    config = StandataBuilder.build_from_file(temp_dir / "categories.yml")
    assert isinstance(config, StandataConfig)
    assert len(config.categories) == 2
    assert len(config.entities) == 2


def test_load_invalid_yaml(temp_dir):
    """Test loading invalid YAML file."""
    invalid_yaml_path = temp_dir / "invalid.yml"
    with open(invalid_yaml_path, "w") as f:
        f.write("invalid: yaml: content: {[}")

    config = StandataBuilder.load_config(invalid_yaml_path)
    assert isinstance(config, StandataConfig)
    assert len(config.categories) == 0
    assert len(config.entities) == 0
