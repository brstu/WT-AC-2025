import importlib.util
import os


def load_students_map(csv_path):
    # import the function from the script file
    script = os.path.abspath('.github/scripts/check_student_directory.py')
    spec = importlib.util.spec_from_file_location('checker', script)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.load_students_map(csv_path)
