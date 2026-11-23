import os

from mat3ra.esse.models.apse.db.third_party_sources import Source
from pymatgen.ext.matproj import MPRester
from ruamel.yaml import YAML

# Paths configured in build-config.js: BUILD_CONFIG.materials.*
MANIFEST_PATH = "assets/materials/manifest.yml"  # BUILD_CONFIG.materials.assets.path + manifest
SOURCES_PATH = "assets/materials"  # BUILD_CONFIG.materials.assets.path


def main():
    """
    Writes the Materials Project record structure of every MaterialsProject manifest entry to its POSCAR as served,
    and records the Materials Project database version in the entry. Reads the API key from MP_API_KEY.
    """
    yaml = YAML()
    yaml.indent(mapping=2, sequence=4, offset=2)
    with open(MANIFEST_PATH, "r") as file:
        manifest = yaml.load(file)
    with MPRester(os.environ["MP_API_KEY"]) as rester:
        for source in manifest["sources"]:
            if source["source"] != Source.MaterialsProject.value:
                continue
            record = rester.summary.search(
                material_ids=source["source_id"], _fields="material_id,structure,builder_meta"
            )[0]
            record["structure"].to(filename=f"{SOURCES_PATH}/{source['filename']}", fmt="poscar")
            database_version = record["builder_meta"]["database_version"]
            source.insert(list(source).index("source") + 1, "database_version", database_version)
            print(f"Fetched {source['source_id']} as {record['material_id']}, database version {database_version}")
    with open(MANIFEST_PATH, "w") as file:
        yaml.dump(manifest, file)


main()
