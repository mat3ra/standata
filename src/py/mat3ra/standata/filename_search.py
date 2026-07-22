import re
from pathlib import Path
from typing import List, Optional, Tuple

NON_ALPHANUMERIC = re.compile(r"[\W_]+")


def canonicalize(text: str) -> str:
    """
    Returns ``text`` lowercased with every run of non-alphanumeric characters collapsed to a
    single underscore.

    This equates case and separator variants ("Band Gap", "band-gap", "band_gap"). Unicode letters and digits are
    preserved as content; only punctuation and whitespace act as separators.
    """
    return NON_ALPHANUMERIC.sub("_", text.casefold()).strip("_")


def _match_sort_key(canonical_query: str, filename: str) -> Optional[Tuple[int, int, str]]:
    """
    Returns a sort key ranking ``filename`` against a canonicalized query, or ``None`` when the
    query is absent from the filename.

    Matches are ordered by decreasing strength: an exact name match (0), a whole-token match (1),
    then a bare substring match (2). Within a rank, shorter names sort first, then filenames
    alphabetically, giving a deterministic order.
    """
    name = canonicalize(Path(filename).stem)
    if canonical_query == name:
        rank = 0
    elif f"_{canonical_query}_" in f"_{name}_":  # underscore padding restricts this to whole tokens
        rank = 1
    elif canonical_query in name:
        rank = 2
    else:
        return None
    return rank, len(name), filename


def rank_filenames(query: str, filenames: List[str]) -> List[str]:
    """
    Returns ``filenames`` ordered by descending relevance to ``query``, best match first.

    Non-matching filenames are omitted, and an empty or separator-only query yields an empty list.
    The ordering is deterministic, so a caller that keeps only the first result gets a stable,
    intent-aligned match instead of one that depends on catalog order.
    """
    canonical_query = canonicalize(query)
    if not canonical_query:
        return []
    matches = (_match_sort_key(canonical_query, filename) for filename in filenames)
    return [filename for *_, filename in sorted(match for match in matches if match is not None)]
