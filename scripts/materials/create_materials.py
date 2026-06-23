import json
import re
from typing import Dict

import yaml
from mat3ra.made.material import Material
from mat3ra.made.tools.convert import (
    from_poscar,
    from_poscar_molecule,
    to_pymatgen,
)
from mat3ra.utils.mixins import RoundNumericValuesMixin

LATTICE_LENGTH_PRECISION = 6
LATTICE_ANGLE_PRECISION = 4

# Paths configured in build-config.js: BUILD_CONFIG.materials.*
MANIFEST_PATH = 'assets/materials/manifest.yml'  # BUILD_CONFIG.materials.assets.path + manifest
SOURCES_PATH = 'assets/materials'  # BUILD_CONFIG.materials.assets.path
DESTINATION_PATH = 'data/materials'  # BUILD_CONFIG.materials.data.path


def read_build_config():
    """
    Read formatting settings from build-config.js
    """
    with open('build-config.ts', 'r') as f:
        content = f.read()
        match = re.search(r"jsonFormat:\s*{\s*spaces:\s*(\d+)", content)
        if match:
            return int(match.group(1))
    return 2  # Default fallback


JSON_INDENT = read_build_config()


def read_manifest(manifest_path: str):
    """
    Reads the manifest file and returns the sources list.

    Args:
        manifest_path (str): Path to the manifest file.

    Returns:
        list: List of sources.
    """
    with open(manifest_path, 'r') as file:
        manifest = yaml.safe_load(file)
    return manifest["sources"]


def convert_to_esse(poscar: str, is_non_periodic: bool = False) -> Dict:
    material_dict = from_poscar_molecule(poscar) if is_non_periodic else from_poscar(poscar)
    material = Material.create(material_dict)
    
    # Round lattice values for human-readable JSON output
    for key in ['a', 'b', 'c']:
        material_dict['lattice'][key] = RoundNumericValuesMixin.round_array_or_number(
            material_dict['lattice'][key], LATTICE_LENGTH_PRECISION
        )
    for key in ['alpha', 'beta', 'gamma']:
        material_dict['lattice'][key] = RoundNumericValuesMixin.round_array_or_number(
            material_dict['lattice'][key], LATTICE_ANGLE_PRECISION
        )
    del material_dict['lattice']['vectors']
    
    # Add reduced formula (Made doesn't populate this by default)
    material_dict['formula'] = to_pymatgen(material).composition.reduced_formula
    
    return material_dict


def construct_name(material_config: Dict[str, str], source: Dict[str, str]) -> str:
    """
    Constructs the name of the material for use as a property in the ESSE material configuration.

    Args:
        material_config (dict): ESSE material configuration.
        source (dict): Source information.

    Returns:
        str: Name of the material.
    """
    name_parts = [
        material_config["formula"],
        source["common_name"],
        f'{source["lattice_type"]} ({source["space_group"]}) {source["dimensionality"]} ({source["form_factor"]})',
        source["source_id"],
    ]
    return ", ".join(name_parts)


def construct_filename(material_config: Dict[str, str], source: Dict[str, str]) -> str:
    common_name = source["common_name"].replace(" ", "_")
    filename_parts = [
        material_config["formula"],
        f"[{common_name}]",
        f"{source['lattice_type']}_[{source['space_group']}]_{source['dimensionality']}_[{source['form_factor']}]",
        f"[{source['source_id']}]",
    ]
    filename = "-".join(filename_parts)
    return filename.replace("/", "%2F")


def create_material_config(material_config: Dict, source: Dict) -> Dict:
    """
    Creates the final material configuration by adding name, external info, and metadata.

    Args:
        material_config (dict): Base ESSE material configuration.
        source (dict): Source information including metadata.

    Returns:
        dict: Complete material configuration.
    """
    name = construct_name(material_config, source)

    final_config = {
        "name": name,
        "lattice": material_config["lattice"],
        "basis": material_config["basis"],
        "external": {
            "id": source["source_id"],
            "source": source["source"],
            "doi": source["doi"],
            "url": source["url"],
            "origin": True,
        },
        "isNonPeriodic": source.get("isNonPeriodic", False),
    }

    if source.get("lattice_type") and not source.get("isNonPeriodic", False):
        final_config["lattice"]["type"] = source["lattice_type"]

    if "metadata" in source:
        final_config["metadata"] = source["metadata"]

    if "tags" in source:
        final_config["tags"] = source["tags"]

    return final_config


def main():
    """
    Main function to create materials listed in the sources manifest.
    """
    materials = []
    for source in read_manifest(MANIFEST_PATH):
        with open(f"{SOURCES_PATH}/{source['filename']}", "r") as file:
            poscar = file.read()
            is_non_periodic = source.get("isNonPeriodic", False)
            material_config = convert_to_esse(poscar, is_non_periodic=is_non_periodic)
            final_config = create_material_config(material_config, source)
            filename = construct_filename(material_config, source)

            with open(f"{DESTINATION_PATH}/{filename}.json", "w") as file:
                json.dump(final_config, file, indent=JSON_INDENT)
                file.write("\n")
            materials.append(final_config)
        print(f"Created {filename}.json")
    print(f"Total materials created: {len(materials)}")


main()
