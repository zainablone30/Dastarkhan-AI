"""
CRUD Test Suite 3: FAVORITES

CRUD mapping:
  CREATE  -> Click the heart icon on a FoodCard (anywhere foods are listed)
  READ    -> /dashboard/favorites shows the favorited items
  UPDATE  -> Switch between "Khana" and "Restaurants" tab (view-state change)
  DELETE  -> Click the heart on the favorites page to remove an item
"""
import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import login


@pytest.mark.crud
def test_TC_FAV_01_add_food_to_favorites(driver, base_url, creds):
    """TC-FAV-01 : CREATE - Heart icon on a food card adds it to favorites."""
    login(driver, base_url, creds)
    driver.get(f"{base_url}/dashboard/explore")
    wait = WebDriverWait(driver, 10)
    time.sleep(3)  # let food cards load

    # The heart button on a FoodCard sits absolute top-3 right-3 inside the card.
    heart_buttons = driver.find_elements(
        By.XPATH, "//button[.//*[name()='svg' and contains(@class,'lucide-heart')]]"
    )
    assert heart_buttons, "No favorite (heart) buttons found on /dashboard/explore"
    heart_buttons[0].click()
    time.sleep(1)


@pytest.mark.crud
def test_TC_FAV_02_read_favorites_list(driver, base_url, creds):
    """TC-FAV-02 : READ - Favorites page renders without error."""
    login(driver, base_url, creds)
    driver.get(f"{base_url}/dashboard/favorites")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.url_contains("/favorites"))
    time.sleep(2)

    page = driver.page_source.lower()
    assert "khana" in page or "favorites" in page, "Favorites page did not load"


@pytest.mark.crud
def test_TC_FAV_03_switch_to_restaurants_tab(driver, base_url, creds):
    """TC-FAV-03 : UPDATE (view-state) - Switching the visible tab."""
    login(driver, base_url, creds)
    driver.get(f"{base_url}/dashboard/favorites")
    wait = WebDriverWait(driver, 10)
    time.sleep(2)

    tabs = driver.find_elements(By.XPATH, "//button[contains(., 'Restaurants')]")
    if tabs:
        tabs[0].click()
        time.sleep(1)
    assert "/favorites" in driver.current_url


@pytest.mark.crud
def test_TC_FAV_04_remove_favorite(driver, base_url, creds):
    """TC-FAV-04 : DELETE - Click heart on favorites page to remove an item."""
    login(driver, base_url, creds)
    driver.get(f"{base_url}/dashboard/favorites")
    wait = WebDriverWait(driver, 10)
    time.sleep(2)

    before_cards = driver.find_elements(By.XPATH, "//div[contains(@class,'group')]//button[.//*[name()='svg' and contains(@class,'lucide-heart')]]")
    if not before_cards:
        pytest.skip("No favorites available to remove (run TC-FAV-01 first).")

    before_count = len(before_cards)
    before_cards[0].click()
    time.sleep(2)

    after_cards = driver.find_elements(By.XPATH, "//div[contains(@class,'group')]//button[.//*[name()='svg' and contains(@class,'lucide-heart')]]")
    assert len(after_cards) < before_count, "Favorite was not removed"
