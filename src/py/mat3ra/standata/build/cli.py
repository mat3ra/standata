from pathlib import Path
from typing import Optional

import typer
from .builder import StandataBuilder


def main(
    yaml_config: str = typer.Argument(..., help="Location of entity config file."),
    destination: Optional[str] = typer.Option("--destination", "-d", help="Where to place symlink directory."),
):
    config_path = Path(yaml_config)
    entity_path_parent = config_path.parent

    standata_config = StandataBuilder.build_from_file(config_path)

    save_dir = config_path.parent
    if destination and Path(destination).resolve().exists():
        save_dir = Path(destination)
    categories_root = save_dir / "by_category"

    for entity in standata_config.entities:
        categories = standata_config.convert_tags_to_categories_list(*entity.categories)
        entity_path = entity_path_parent / entity.filename

        for category in categories:
            category_dir = categories_root / category
            category_dir.mkdir(parents=True, exist_ok=True)
            linked_entity = category_dir / entity.filename
            if not linked_entity.exists():
                linked_entity.symlink_to(entity_path)


def typer_app():
    typer.run(main)


if __name__ == "__main__":
    typer_app()
