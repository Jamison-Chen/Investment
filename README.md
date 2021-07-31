# Your Investment Helper

* This app helps you to record your investment history, to do some statistics, and visualize it for you.

* The other usage of this app is to simulate and visualize the performance of different investment strategies.

---

>## Investment Recorder

##### TODOS

* Povide spaces to write down investment memo for each company.

#### Things that has problem to implement

* Draw a graph that describe the fluctuation of the holding-securities' market value.

    If a user suddenly add a trade record that happened many years ago, the local backend server then need to query lots of historical data from the remote server and then store all of them, which is very time and space-consuming.

    Moreover, if the action that user had done is just "by mistake", the whole process will then be considered waste of both time and space.

#### Things that you should know

* FIFO

    When selling stocks, we assume that you always sell from the first one you bought in. (This will be reflected when calculating how much cash you've invested.)

---

>## Stock Market Simulator

There are two versions of simulator: the normal one and the Pro version.

> ### Normal Simulator

In this version, the price fluctuation is simulated via *Random Walk*.

There's no animation in this version. That is, once you click the button **Random Walk**, you will see the final result of simulation directly.

There're a few strategy buttons for you to click. After clicking each of them, you can see the detailed info includes how much money has this strategy invested at any point of time, the total market value, and the cash remained.

There is one last button called **Comparison**. This shows you the comparison of the performances of all the strategies, so that you can access which strategy is better for which specific price-fluctuating situation.

> ### Simulator Pro

The main difference between the Pro version and the normal one is that in this version, the price is not determined by Random Walk anymore. Instead, each price is determine through the process of **matching each demand to each supply**, which just like what happen in the real world. Consequently, you can see the animation of the price generating one by one.

Moreover, you can controll the componets of the market you are in, which means that it's for you to decide what strategies are all the other people using ans, of course, what strategy are you using.

After deciding the component of the market, you will see many squares on the screen, each of them represent a person in the market, and then you can start simulate. And you can see how your assets value fluctuating just like the normal version by clicking the square that represent you.
