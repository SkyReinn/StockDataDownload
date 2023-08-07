const { NseIndia } = require("stock-nse-india");
const prompt = require("prompt");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const nseIndia = new NseIndia();

prompt.start();

prompt.get(["symbol", "startDate", "endDate"], function (err, result) {
    if (err) {
        console.error(err);
        return;
    }

    const symbol = result.symbol;
    const startDate = new Date(result.startDate);
    const endDate = new Date(result.endDate);

    const range = {
        start: startDate,
        end: endDate,
    };

    nseIndia
        .getEquityHistoricalData(symbol, range)
        .then((response) => {
            const data = response[0].data;

            console.log("Received Data:", data);

            const formattedData = data.map((item) => ({
                Date: item.CH_TIMESTAMP,
                Open: item.CH_OPENING_PRICE,
                High: item.CH_TRADE_HIGH_PRICE,
                Low: item.CH_TRADE_LOW_PRICE,
                Close: item.CH_CLOSING_PRICE,
            }));

            const fileName = `${symbol}_${startDate.toISOString().slice(0, 10)}~${endDate.toISOString().slice(0, 10)}_historical_data.csv`;

            const csvWriter = createCsvWriter({
                path: fileName,
                header: [
                    { id: "Date", title: "Date" },
                    { id: "Open", title: "Open" },
                    { id: "High", title: "High" },
                    { id: "Low", title: "Low" },
                    { id: "Close", title: "Close" },
                ],
            });

            csvWriter
                .writeRecords(formattedData)
                .then(() => {
                    console.log("CSV file has been written successfully.");
                })
                .catch((csvError) => {
                    console.error("Error writing CSV file:", csvError);
                });
        })
});
