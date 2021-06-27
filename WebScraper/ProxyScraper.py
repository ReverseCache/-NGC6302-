import io
import os
import sys
import time
import json
import re
import ftplib
import lxml
import requests
import StringIO as sio
import datetime as dt
import pandas as pd
from requests_html import HTMLSession
import numpy as np
from bs4 import BeautifulSoup as bs
import selenium.webdriver as wd
import dask as dk
import tqdm as tqdm
import ThreadPoolExecutor as tpe


class CoreModules(object):

    def __init__(self, ticker, freq='A'):
        self.head = False
        self.download_path = os.getcwd()
        self.chromedriver_path = os.path.dirname(__file__)
        self.ticker = ticker
        self.freq = freq

    def chromedriver(self):
        filepath = self.chromedriver_path
        if '/' in filepath:
            filepath = '/'.join(filepath.split('/')) + '/webdrivers/'
        elif '\\' in filepath:
            filepath = '\\'.join(filepath.split('\\')) + '\\webdrivers\\'
        if 'darwin' in sys.platform:
            return filepath + 'chromedriver_mac'
        elif 'win' in sys.platform:
            return filepath + 'chromedriver_windows.exe'
        elif 'linux' in sys.platform:
            return filepath + 'chromedriver_linux'

    def script_exec(self, driver, element):
        return driver.execute_script("arguments[0].scrollIntoView({behavior: 'auto', block: 'center', inline: 'center'});", element)

    def ratios(self):
        caps = wd.common.desired_capabilities().CHROME
        caps["pageLoadStrategy"] = "none"
        driver = self.loaddriver(caps=caps)

        url = f'https://www.macrotrends.net/stocks/charts/{self.ticker}'
        driver.get(url)
        time.sleep(5)
        url = driver.current_url + \
            f'{"financial-ratios"}?freq={self.freq.upper()}'
        driver.get(url)
        try:
            element = wd.support.ui(driver, 30).until(wd.support.expected_conditions.presence_of_element_located(
                (wd.common.by.XPATH, '//button[contains(text(), "Accept all")]')))
        except:
            pass
        if len(driver.find_elements_by_xpath('//button[contains(text(), "Accept all")]')) != 0:
            element = driver.find_element_by_xpath(
                '//button[contains(text(), "Accept all")]')
            self.script_exec(driver, element)
            wd.common.action_chains(driver).move_to_element(
                element).click().perform()
            time.sleep(2)

        table = [self._get_table(driver.page_source)]
        condition = True
        string_check = ''
        int_check = 0
        header = driver.find_elements_by_xpath(
            '//div[@role="columnheader"]')[2].text

        while condition:

            if len(driver.find_elements_by_xpath('//button[contains(text(), "Accept all")]')) > 0:
                element = driver.find_element_by_xpath(
                    '//button[contains(text(), "Accept all")]')
                self.script_exec(driver, element)
                wd.common.action_chains(driver).move_to_element(
                    element).click().perform()
                time.sleep(3)
                table.append(self._get_table(driver.page_source))
            element = driver.find_elements_by_xpath(
                '//div[@role="gridcell"]')[-1]
            self.script_exec(driver, element)
            element = wd.support.ui(driver, 30).until(wd.support.expected_conditions.presence_of_element_located(
                (wd.common.by.XPATH, '//div[@class="jqx-reset jqx-icon-arrow-right"]')))
            element = driver.find_element_by_xpath(
                '//div[@class="jqx-reset jqx-icon-arrow-right"]')
            self.script_exec(driver, element)
            wd.common.action_chains(driver).click_and_hold(element).perform()
            time.sleep(6)
            wd.common.action_chains(driver).release(
                element).move_by_offset(-50, -50).perform()
            header = driver.find_elements_by_xpath(
                '//div[@role="columnheader"]')[2].text
            time.sleep(6)
            if len(driver.find_elements_by_xpath('//button[contains(text(), "Accept all")]')) == 0:
                table.append(self._get_table(driver.page_source))
            if string_check == header:
                if int_check == 5:
                    condition = False
                int_check += 1
            string_check = header
        table = pd.concat(table, axis=1)
        table = table.loc[:, ~table.columns.duplicated()]
        dataset = table
        dataset.replace(',', '', regex=True, inplace=True)
        dataset.replace('\$', '', regex=True, inplace=True)
        dataset = dataset.transpose()
        for col in dataset.columns:
            col.replace(' ', '_')
            col.replace('/', '_to_')
            col.replace('.', '')
            col.replace('__', '_')
            col.replace('&', 'and').lower()
        for col in dataset.columns:
            for i in col:
                if i == "-":
                    i = 0
        dataset.replace('', 'NaN', inplace=True)
        dataset.index = pd.to_datetime(dataset.index, format='%Y-%m-%d')
        dataset.index.name = 'date'
        dataset.sort_index(inplace=True)
        dataset = dataset.replace({'T': 'E12', 'B': 'E9', 'M': 'E6',
                                   'K': 'E3', 'k': 'E3', '%': 'E-2', ',': ''}, regex=True)
        for col in dataset.columns:
            col = col.astype(float)
        return dataset.astype('float')

    def loaddriver(self, caps='none', accept_insecure=False):

        options = wd.ChromeOptions()
        prefs = {}
        prefs['profile.default_content_settings.popups'] = 0
        prefs['download.default_directory'] = self.download_path
        prefs['profile.default_content_setting_values.automatic_downloads'] = 1

        options.add_argument('--no-sandbox')
        options.add_argument('--disable-setuid-sandbox')
        options.add_argument('--start-maximized')
        options.add_experimental_option('prefs', prefs)
        options.add_experimental_option(
            "excludeSwitches", ['enable-automation'])
        options.add_experimental_option('useAutomationExtension', False)
        if accept_insecure:
            options.add_argument('--ignore-ssl-errors=yes')
            options.add_argument('--ignore-certificate-errors')
        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.53 Safari/537.36'
        options.add_argument(f'user-agent={user_agent}')
        if not self.head:
            options.add_argument('--headless')
        if caps == 'none':
            caps = wd.common.desired_capabilities().CHROME
            caps["pageLoadStrategy"] = "none"
            driver = wd.Chrome(executable_path=self.chromedriver(
            ), options=options, desired_capabilities=caps)
        else:
            caps = wd.common.desired_capabilities().CHROME
            caps["pageLoadStrategy"] = "normal"
            driver = wd.Chrome(executable_path=self.chromedriver(
            ), options=options, desired_capabilities=caps)

        driver.execute_script(
            f"var s=window.document.createElement('script'); s.src='{self._get_chromedriver_path}javascriptM.js';window.document.head.appendChild(s);")

        driver.set_window_size(1400, 1000)
        driver.set_page_load_timeout(600)
        driver.delete_all_cookies()

        return driver

    def get_htmlsession(self, url):

        session = HTMLSession
        r = session.get(url)
        soup = bs(r.content, 'html5lib')
        return soup

    def parse_json(url):
        html = requests.get(url=url).text
        data = json.loads(html.split('root.App.main =')[1].split('(this)')[0].split(';\n}')[0].strip())[
            'context']['dispatcher']['stores']['QuoteSummaryStore']
        json_dump = json.dumps(data).replace('{}', 'null')
        json_info = json.loads(
            re.sub(r'\{[\'|\"]raw[\'|\"]:(.*?),(.*?)\}', r'\1', json_dump))
        return json_info

    def historical_prices(ticker, start=None, end=None):

        if start == None:
            start = -int(np.inf)

        if end == None:
            last_close = (dt.datetime.today()).strftime("%Y-%m-%d")
            end = int(time.mktime(time.strptime(
                f'{last_close} 00:00:00', '%Y-%m-%d %H:%M:%S')))

        url = f'https://query2.finance.yahoo.com/v7/finance/download/{ticker}?period1={start}&period2={end}&interval=1d'
        df = pd.read_csv(sio(requests.get(url).text))
        for col in df.columns:
            col.lower().replace(' ', '_')
        df.index = pd.to_datetime(df.date, format='%Y-%m-%d')
        df.drop('date', inplace=True, axis=1)
        return df


class PriceList(CoreModules):

    def __init__(self, ticker, head, download_path, chromedriver_path, range_set):
        super().__init__(ticker, head, download_path, chromedriver_path)
        self.range_set = range_set

    def prices(self, date):
        db = CoreModules()
        if type(date) == type('str'):
            date = pd.to_datetime(date, format='%Y-%m-%d')
        y, m, d = str(date.year), '0' + str(date.month), '0' + str(date.day)
        if len(str(date.month)) == 3 or len(str(date.day)) == 3:
            m, d = str(date.month)[:2], str(date.day)[:2]
        url = f'https://www.mrci.com/ohlc/{y}/{y[-2:]+m+d}.php'
        soup = db.get_htmlsession(url)
        df = pd.read_html(str(soup.find('map').find_next('table')))[0]
        indices = []
        for i, j in enumerate(df.iloc[:, 0]):
            if j in pd.read_csv(os.path.dirname(
                    __file__) + '/futures_lookup.csv').name.tolist():
                indices.append(i)
        if len(df.columns) == 11:
            df = df.iloc[indices[0]:-2, :len(df.columns)-1]
        else:
            df = df.iloc[indices[0]:-2, :]
        df.columns = ['month', 'date', 'open', 'high', 'low', 'close',
                      'change', 'volume', 'open_interest', 'change_in_oi']
        boolean_flag = True
        for i in range(1, len(indices)):
            temp = df.loc[indices[i-1]+1:indices[i]-2].copy()
            temp['future'] = df.loc[indices[i-1], 'month']
            if boolean_flag:
                out = temp.copy()
                boolean_flag = False
            else:
                out = out.append(temp)
        out = out[out.iloc[:, 1] != 'Total Volume and Open Interest']
        out.index = [date] * len(out)
        out.replace('\+', '', regex=True, inplace=True).replace('unch', np.nan, inplace=True).replace({'T': 'E12', 'B': 'E9', 'M': 'E6',
                                                                                                       'K': 'E3', 'k': 'E3', '%': 'E-2', ',': ''}, regex=True)
        for col in out.columns:
            col = col.astype(float)
        return dk.dataframe.from_pandas(out, npartitions=1)

    def price_data(self):
        with tpe(8) as pool:
            maximum = len(self.range_set)
            listy = list(
                tqdm(pool.map(self.prices, self.range_set), total=maximum))
            listx = []
            for i in listy:
                if isinstance(i, list):
                    listx.append(i)
        df = dk.concat(listx, axis=0).compute()
        df.index.name = 'date'
        return df


# current_ratio = current_assets / current_liabilities
# working_capital = current_assets - current_liabilities
# longterm_debt_to_capital = longterm_debt/working_capital
# debt_to_equity_ratio = total_shareholders_equity - total_liabilities
# gross_margin = (total_revenue - cost_of_goods_sold)/total_revenue
# operating_income = sales - cost_of_goods_sold - operating_expenses - depreciation
# operating_margin = operating_income / sales_revenues
# ebit_margin,
# ebitda_margin,
# pretax_profit_margin,
# net_profit_margin,
# asset_turnover,
# inventory_turnover_ratio,
# receiveable_turnover,
# days_sales_in_receivables,
# roe__return_on_equity,
# return_on_tangible_equity,
# roa__return_on_assets,
# roi__return_on_investment,
# book_value_per_share,
# operating_cash_flow_per_share,
# free_cash_flow_per_share
