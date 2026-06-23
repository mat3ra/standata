import os
from unittest.mock import patch

import pytest
from mat3ra.standata.build.cli import main


def test_create_category_structure(temp_dir):
    """Test creation of category structure."""
    main(yaml_config=str(temp_dir / "categories.yml"), destination=None)

    # Verify the structure was created correctly
    categories_root = temp_dir / "by_category"
    assert (categories_root / "dimensionality/2D").exists()
    assert (categories_root / "dimensionality/3D").exists()
    assert (categories_root / "type/metal").exists()
    assert (categories_root / "type/semiconductor").exists()


def test_custom_destination(temp_dir):
    """Test creating category structure in custom destination."""
    custom_dest = temp_dir / "custom_dest"
    custom_dest.mkdir()

    main(yaml_config=str(temp_dir / "categories.yml"), destination=str(custom_dest))

    # Verify the structure was created in custom destination
    categories_root = custom_dest / "by_category"
    assert (categories_root / "dimensionality/2D").exists()
    assert (categories_root / "type/metal").exists()


def test_symlink_creation(temp_dir):
    """Test if symlinks are created correctly."""
    main(yaml_config=str(temp_dir / "categories.yml"), destination=None)

    metal_link = temp_dir / "by_category/type/metal/material1.json"
    assert metal_link.exists()
    assert metal_link.is_symlink()
    assert metal_link.resolve() == (temp_dir / "material1.json").resolve()


@pytest.mark.skipif(os.name == "nt", reason="Symlinks might not work on Windows without admin privileges")
def test_permission_error(temp_dir):
    """Test handling of permission errors during symlink creation."""
    with patch("pathlib.Path.symlink_to", side_effect=PermissionError):
        with pytest.raises(PermissionError):
            main(yaml_config=str(temp_dir / "categories.yml"), destination=None)


def test_nonexistent_config(temp_dir):
    """Test handling of non-existent config file."""
    with pytest.raises(FileNotFoundError):
        main(yaml_config=str(temp_dir / "nonexistent.yml"), destination=None)


def test_duplicate_run(temp_dir):
    """Test running the command twice (should handle existing symlinks)."""
    main(yaml_config=str(temp_dir / "categories.yml"), destination=None)
    main(yaml_config=str(temp_dir / "categories.yml"), destination=None)

    categories_root = temp_dir / "by_category"
    assert (categories_root / "dimensionality/2D").exists()
    metal_link = categories_root / "type/metal/material1.json"
    assert metal_link.is_symlink()
