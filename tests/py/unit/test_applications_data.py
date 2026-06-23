from mat3ra.standata.applications import ApplicationStandata
from mat3ra.standata.data.applications import applications_data
from mat3ra.standata.data.executable_flavor_map_by_application import executable_flavor_map_by_application_data


def test_get_by_name():
    application = ApplicationStandata.get_by_name_first_match("espresso")
    assert type(application) == dict
    assert application["name"] == "espresso"
    assert application["version"] == "6.3"


def test_get_by_categories():
    applications = ApplicationStandata.get_by_categories("quantum-mechanical")
    assert isinstance(applications, list)
    assert applications[0]["name"] == "espresso"


def test_get_application_data():
    application = applications_data["filesMapByName"]["espresso/espresso_gnu_6.3.json"]
    assert type(application) == dict
    assert application["name"] == "espresso"
    assert application["version"] == "6.3"


def test_get_by_name_and_categories():
    application = ApplicationStandata.get_by_name_and_categories("vasp", "quantum-mechanical")
    assert type(application) == dict
    assert application["name"] == "vasp"
    assert application["version"] == "5.4.4"


def test_list_all():
    applications = ApplicationStandata.list_all()
    assert isinstance(applications, dict)
    assert len(applications) >= 1
    assert "espresso" in applications
    assert isinstance(applications["espresso"], list)
    assert len(applications["espresso"]) >= 1
    assert isinstance(applications["espresso"][0], dict)
    assert "version" in applications["espresso"][0]
    assert "build" in applications["espresso"][0]
    assert applications["espresso"][0]["version"] == "6.3"
    assert applications["espresso"][0]["build"] == "GNU"


def test_get_as_list():
    applications_list = ApplicationStandata.get_as_list()
    assert isinstance(applications_list, list)
    assert len(applications_list) >= 1
    assert isinstance(applications_list[0], dict)
    assert applications_list[0]["name"] == "espresso"


def test_executable_flavor_map_by_application_has_espresso_pw_x():
    assert "espresso" in executable_flavor_map_by_application_data
    assert "pw.x" in executable_flavor_map_by_application_data["espresso"]
    assert "flavors" in executable_flavor_map_by_application_data["espresso"]["pw.x"]


def test_application_standata_get_app_tree_for_application():
    tree = ApplicationStandata.get_executable_flavor_map_by_application_name("espresso")
    assert "pw.x" in tree


def test_application_standata_get_all_app_tree():
    tree = ApplicationStandata.get_executable_flavor_map()
    assert "espresso" in tree
