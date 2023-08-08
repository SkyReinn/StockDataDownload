const { NseIndia } = require("stock-nse-india");
const nseIndia = new NseIndia();

const stock = 'TATASTEEL';
const startDate = new Date('2023-07-02');
const endDate = new Date('2023-08-04');


// Define a function that splits the date range (API can only retrieve around 45 days of data at once)
function splitDateRangeByMonths() {
    const dateRanges = [];
    let currentStartDate = new Date(startDate);

    while (currentStartDate <= endDate) {
        const lastDayOfMonth = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth() + 1, 0);
        const currentEndDate = lastDayOfMonth < endDate ? lastDayOfMonth : endDate;
        
        dateRanges.push({
            start: new Date(currentStartDate),
            end: new Date(currentEndDate)
        });

        currentStartDate = new Date(currentEndDate);
        currentStartDate.setDate(currentStartDate.getDate() + 1);
    }

    console.log(dateRanges)
    return dateRanges;
}


function getData(range) {
    return nseIndia.getEquityHistoricalData(stock, range).then((response) => {
        const data = response[0].data;
        console.log(data);
    });
}

dateRanges = splitDateRangeByMonths()
for (let i=0;i<dateRanges.length;i++) {
    getData(dateRanges[i]);
}