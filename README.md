# Your Investment Helper

* This app helps you to record your investment history, to do some statistics, and visualize it for you.

* The other usage of this app is to simulate and visualize the performance of different investment strategies.

---

>## Installation

### Enviroment Required

* Python (version >= 3)
* Node.js (version >= 12)
* npm (version >= 6)
* pipenv

### Steps to Follow

Step 1

    git clone https://github.com/Jamison-Chen/Investment.git

Step 2

>./

    npm i --production

Step 3

>./backend

    pipenv install --ignore-pipfile

Step 4

>./backend/investment

    python manage.py migrate

Step 5 (optional)

You can replace the original db.sqlite3 file by the file that you already recorded some data in.

---

>## Open the App

./

    npm use

---

>## Project Description

### **Investment Recorder**

#### TODOS

* Povide spaces to write down investment memo for each company.

#### Things that has problem to implement

* Draw a graph that describe the fluctuation of the holding-securities' market value.

    If a user suddenly add a trade record that happened many years ago, the local backend server then need to query lots of historical data from the remote server and then store all of them, which is very time and space-consuming.

    Moreover, if the action that user had done is just "by mistake", the whole process will then be considered waste of both time and space.

#### Things that you should know

* FIFO

    When selling stocks, we assume that you always sell from the first one you bought in. (This will be reflected when calculating how much cash you've invested.)

---

### **Stock Market Simulator**

There are two versions of simulator: the normal one and the Pro version.

> ### Normal Simulator

* In this version, the price fluctuation is simulated via **Random Walk**.

* Once you click the button *Random Walk*, you will see the final result of simulation directly.

* There're a few strategy buttons for you to click. You can see the detailed info including the performance of each strategy.

* The *Comparison* button shows you the comparison of the performances of all the strategies.

> ### Simulator Pro

* Each price is determine through the process of **matching each demand to each supply** in this version, which trys to mimic trades happen in the real world.

* You can see the animation of the price generating day after day.

* It's for you to decide what strategies are all the other people using and what strategy are you using.

* Each of the square on the left-hand side represents a person in the market.

* You can see how your assets value fluctuating just like the normal version by clicking the first square, which represents you.
