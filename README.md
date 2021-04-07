# Investment Recorder & Simulator

>## Main Functions

1. This app helps you to record your investment history, to do some statistics, and visualize it for you.

2. The other usage of this app is to simulate and visualize the performance of different investment strategies.

---

>## Investment Rcorder

### TODOS

1. Create time interval options for the cash-invested chart:

    * a month

    * a year

    * all

2. Provide both overview and individual view of stocks.

---

### Things that has problem to implement

1. Draw a graph that describe the fluctuation of the holding-securities' market value.

    If a user suddenly add a trade record that happened many years ago, the local backend server then need to query lots of historical data from the remote server and then store all of them, which is very time and space-consuming.
    Moreover, if the action that user had done is just "by mistake", the whole process will then be considered waste of both time and space.

---

### Things that you should know

1. FIFO

    When selling stocks, we assume that you always sell from the first one you bought in. (This will be reflected when calculating how much cash you've invested.)

---

>## Investment Simulator

TBD
