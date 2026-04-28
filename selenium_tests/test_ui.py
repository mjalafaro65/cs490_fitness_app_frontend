from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"

def test_homepage_loads():
    driver = webdriver.Chrome()
    wait = WebDriverWait(driver, 10)

    driver.get(BASE_URL)

    wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

    assert len(driver.page_source) > 100

    driver.quit()