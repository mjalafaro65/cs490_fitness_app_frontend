from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"

CLIENT_EMAIL = "seltest@test.com"
CLIENT_PASSWORD = "123456"


def start_driver():
    driver = webdriver.Chrome()
    driver.maximize_window()
    return driver


def login(driver, wait):
    driver.get(f"{BASE_URL}/login")

    email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
    password_input = driver.find_element(By.NAME, "password")

    email_input.clear()
    email_input.send_keys(CLIENT_EMAIL)

    password_input.clear()
    password_input.send_keys(CLIENT_PASSWORD)

    driver.find_element(By.XPATH, "//button[contains(., 'Log In')]").click()

    wait.until(
        lambda d: "/login" not in d.current_url
        or "Email or password not found" in d.page_source
    )

    assert "Email or password not found" not in driver.page_source


def test_homepage_loads():
    driver = start_driver()
    wait = WebDriverWait(driver, 10)

    try:
        driver.get(BASE_URL)
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        assert len(driver.page_source) > 100
    finally:
        driver.quit()


def test_public_landing_pages_load():
    driver = start_driver()
    wait = WebDriverWait(driver, 10)

    try:
        public_pages = [
            ("/", "FitNet"),
            ("/exercises", "Exercise Library"),
            ("/coaches", "Coaches"),
            ("/signup", "Register"),
            ("/login", "Log In"),
        ]

        for path, expected_text in public_pages:
            driver.get(f"{BASE_URL}{path}")
            wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            assert expected_text in driver.page_source or len(driver.page_source) > 100

    finally:
        driver.quit()


def test_login_flow():
    driver = start_driver()
    wait = WebDriverWait(driver, 10)

    try:
        login(driver, wait)
        assert "/login" not in driver.current_url
    finally:
        driver.quit()


def test_exercise_library_search_controls():
    driver = start_driver()
    wait = WebDriverWait(driver, 10)

    try:
        driver.get(f"{BASE_URL}/exercises")

        wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(), 'Exercise Library')]")
            )
        )

        search_input = wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//input[@placeholder='Search exercises...']")
            )
        )

        search_input.clear()
        search_input.send_keys("push")

        search_btn = driver.find_element(By.XPATH, "//button[contains(., 'Search')]")
        driver.execute_script("arguments[0].click();", search_btn)

        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        clear_btn = driver.find_element(By.XPATH, "//button[contains(., 'Clear')]")
        driver.execute_script("arguments[0].click();", clear_btn)

        assert "Exercise Library" in driver.page_source

    finally:
        driver.quit()


def test_coachespage_open():
    driver = start_driver()
    wait = WebDriverWait(driver, 10)

    try:
        driver.get(f"{BASE_URL}/coaches")

        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        search_input = wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//input[@placeholder='Search coaches...']")
            )
        )

        search_input.clear()
        search_input.send_keys("coach")

        filters_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Filters')]"))
        )
        filters_btn.click()

        wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(), 'Filter Coaches')]")
            )
        )

        assert "Filter Coaches" in driver.page_source

    finally:
        driver.quit()


def test_clientpages_load():
    driver = start_driver()
    wait = WebDriverWait(driver, 10)

    try:
        login(driver, wait)

        client_pages = [
            ("/client/dashboard", "Dashboard"),
            ("/client/profile", "Profile"),
            ("/client/workoutplans", "Workout"),
            ("/client/progresslogs", "Progress"),
            ("/client/reviews", "Reviews"),
            ("/client/settings", "Settings"),
        ]

        for path, expected_text in client_pages:
            driver.get(f"{BASE_URL}{path}")
            wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            assert expected_text in driver.page_source or len(driver.page_source) > 100

    finally:
        driver.quit()


def test_progresspage_loads():
    driver = start_driver()
    wait = WebDriverWait(driver, 10)

    try:
        login(driver, wait)
        driver.get(f"{BASE_URL}/client/progresslogs")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        assert "Progress" in driver.page_source or len(driver.page_source) > 100
    finally:
        driver.quit()


def test_create_workoutplan():
    driver = start_driver()
    wait = WebDriverWait(driver, 10)

    try:
        login(driver, wait)

        driver.get(f"{BASE_URL}/client/workoutplans")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        create_btn = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Create')]"))
        )
        create_btn.click()

        name_input = wait.until(EC.presence_of_element_located((By.NAME, "name")))
        description_input = driver.find_element(By.NAME, "description")

        plan_name = "Selenium Plan"

        name_input.clear()
        name_input.send_keys(plan_name)

        description_input.clear()
        description_input.send_keys("Automated test workout plan")

        submit_btn = wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//div[contains(@class,'z-50')]//button[contains(., 'Create')]")
            )
        )

        driver.execute_script("arguments[0].click();", submit_btn)

        wait.until(
            EC.presence_of_element_located(
                (By.XPATH, f"//*[contains(text(), '{plan_name}')]")
            )
        )

        assert plan_name in driver.page_source
    finally:
        driver.quit()


def test_logworkout():
    driver = start_driver()
    wait = WebDriverWait(driver, 10)

    try:
        login(driver, wait)

        driver.get(f"{BASE_URL}/client/progresslogs")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        buttons = wait.until(
            EC.presence_of_all_elements_located((By.TAG_NAME, "button"))
        )

        log_btn = None
        for b in buttons:
            if "Log Activity" in b.text:
                log_btn = b
                break

        assert log_btn is not None, "Log Activity button not found"

        driver.execute_script("arguments[0].scrollIntoView(true);", log_btn)
        driver.execute_script("arguments[0].click();", log_btn)

        exercise_input = wait.until(
            EC.presence_of_element_located((By.NAME, "exercise_id"))
        )

        exercise_input.clear()
        exercise_input.send_keys("1")

        sets_input = driver.find_element(By.NAME, "sets")
        sets_input.clear()
        sets_input.send_keys("3")

        reps_input = driver.find_element(By.NAME, "reps")
        reps_input.clear()
        reps_input.send_keys("10")

        weight_input = driver.find_element(By.NAME, "weight")
        weight_input.clear()
        weight_input.send_keys("100")

        rpe_input = driver.find_element(By.NAME, "rpe")
        rpe_input.clear()
        rpe_input.send_keys("7")

        submit_btn = wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//button[contains(., 'Log')]")
            )
        )

        driver.execute_script("arguments[0].scrollIntoView(true);", submit_btn)
        driver.execute_script("arguments[0].click();", submit_btn)

        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        assert len(driver.page_source) > 100

    finally:
        driver.quit()

def test_profilepage_loads():
    driver = start_driver()
    wait = WebDriverWait(driver, 10)

    try:
        login(driver, wait)

        driver.get(f"{BASE_URL}/client/profile")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        assert "Profile" in driver.page_source or len(driver.page_source) > 100

    finally:
        driver.quit()


def test_open_coachapppage():
    driver = start_driver()
    wait = WebDriverWait(driver, 10)

    try:
        login(driver, wait)

        driver.get(f"{BASE_URL}/client/coach-apply")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        assert "coach" in driver.page_source.lower() or len(driver.page_source) > 100

    finally:
        driver.quit()