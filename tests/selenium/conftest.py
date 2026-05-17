import os
import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = os.environ.get("DASTARKHAN_BASE_URL", "http://localhost:3000")
LANGUAGE_STORAGE_KEY = "dk-language"
TEST_LANGUAGE = os.environ.get("DASTARKHAN_TEST_LANGUAGE", "en")
TEST_LANGUAGE_LABEL = os.environ.get("DASTARKHAN_TEST_LANGUAGE_LABEL", "English")


TEST_EMAIL = os.environ.get("DASTARKHAN_TEST_EMAIL", "testing@gmail.com")
TEST_PASSWORD = os.environ.get("DASTARKHAN_TEST_PASSWORD", "12345678")
TEST_FULLNAME = os.environ.get("DASTARKHAN_TEST_NAME", "Selenium Tester")


def _visible_language_button(driver, label):
    desired = label.strip().lower()
    fallback_labels = {"english", "natural"}

    for button in driver.find_elements(By.TAG_NAME, "button"):
        text = button.text.strip().lower()
        if not text:
            continue
        if (desired in text or text in fallback_labels) and button.is_displayed() and button.is_enabled():
            return button
    return False


def select_language_if_prompted(driver, label=TEST_LANGUAGE_LABEL, timeout=2):
    """Close the first-run language prompt if it is blocking the page."""
    try:
        if driver.execute_script(
            "return window.localStorage.getItem(arguments[0]);",
            LANGUAGE_STORAGE_KEY,
        ):
            button = _visible_language_button(driver, label)
            if not button:
                return
            button.click()
            return
    except WebDriverException:
        pass

    try:
        button = WebDriverWait(driver, timeout, poll_frequency=0.2).until(
            lambda d: _visible_language_button(d, label)
        )
    except TimeoutException:
        return

    button.click()
    try:
        WebDriverWait(driver, 5).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
    except TimeoutException:
        pass


def remember_test_language(driver):
    """Seed localStorage so every fresh browser skips the language modal."""
    driver.get(BASE_URL)
    try:
        driver.execute_script(
            "window.localStorage.setItem(arguments[0], arguments[1]);",
            LANGUAGE_STORAGE_KEY,
            TEST_LANGUAGE,
        )
    except WebDriverException:
        select_language_if_prompted(driver)


def install_language_prompt_handler(driver):
    """Make every test navigation resilient to the first-run language modal."""
    raw_get = driver.get

    def get_and_handle_language_prompt(url):
        raw_get(url)
        select_language_if_prompted(driver)

    driver.get = get_and_handle_language_prompt


@pytest.fixture(scope="function")
def driver():
    """Fresh Chrome browser per test (isolates state).

    Uses Selenium Manager (built into Selenium 4.10+) to auto-resolve the
    correct ChromeDriver binary for whatever Chrome version is installed.
    """
    options = Options()
    # Set HEADLESS=1 to run without a visible browser window
    if os.environ.get("HEADLESS", "0") == "1":
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1366,900")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    drv = webdriver.Chrome(options=options)
    drv.implicitly_wait(5)
    remember_test_language(drv)
    install_language_prompt_handler(drv)
    yield drv
    drv.quit()


@pytest.fixture
def base_url():
    return BASE_URL


@pytest.fixture
def creds():
    return {"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": TEST_FULLNAME}


def login(driver, base_url, creds):
    """Helper used by multiple tests."""
    driver.get(f"{base_url}/login")
    select_language_if_prompted(driver)
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(creds["email"])
    driver.find_element(By.NAME, "password").send_keys(creds["password"])
    driver.find_element(By.XPATH, "//button[contains(., 'Sign In')]").click()
    # Wait for redirect to dashboard
    wait.until(EC.url_contains("/dashboard"))
    time.sleep(1)
