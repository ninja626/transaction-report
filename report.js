(async () => {

    // Open report tab first to avoid popup blocking
    const newPage = window.open("", "_blank");

    if (!newPage) {
        alert("Popup blocked. Please allow popups and try again.");
        return;
    }


    // Create input form
    const userInput = await new Promise((resolve) => {

        const box = document.createElement("div");

        box.style.position = "fixed";
        box.style.top = "50%";
        box.style.left = "50%";
        box.style.transform = "translate(-50%, -50%)";
        box.style.background = "white";
        box.style.padding = "25px";
        box.style.border = "1px solid #ccc";
        box.style.zIndex = "999999";
        box.style.fontFamily = "Arial";
        box.style.boxShadow = "0 0 10px #999";


        box.innerHTML = `

            <h3>Transaction Report Filter</h3>


            <label>Transaction Type:</label><br>

            <select id="type">

                <option value="Fund Transfer (Credit)">
                    Credit
                </option>

                <option value="Fund Transfer (Debit)">
                    Debit
                </option>

            </select>


            <br><br>


            <label>Wallet ID:</label><br>

            <input 
                id="wallet"
                value="8004400088019"
                style="width:250px"
            >


            <br><br>


            <label>From Date:</label><br>

            <input 
                id="fromDate"
                value="1 Jul 2026"
                style="width:250px"
            >


            <br><br>


            <label>To Date:</label><br>

            <input 
                id="toDate"
                value="30 Jul 2026"
                style="width:250px"
            >


            <br><br>


            <button id="submit">
                Generate Report
            </button>

        `;


        document.body.appendChild(box);


        document.getElementById("submit").onclick = () => {


            const data = {

                type: document.getElementById("type").value,

                wallet: document.getElementById("wallet").value,

                fromDate: document.getElementById("fromDate").value,

                toDate: document.getElementById("toDate").value

            };


            box.remove();

            resolve(data);

        };


    });



    const formattedFromDate =
        userInput.fromDate.replace(/ /g, "+");


    const formattedToDate =
        userInput.toDate.replace(/ /g, "+");



    const url =
        `/api/v1/transaction/list?sort=transactionDate%7Cdesc&page=1&perPage=5000&partnerId=80044&walletId=${userInput.wallet}&fromDate=${formattedFromDate}&toDate=${formattedToDate}&category=ewallet&lang=en`;



    try {


        const result = await fetch(url)
            .then(r => r.json());



        const transactions = result.data

            .filter(x =>

                x.transactionStatus === "Settled" &&

                x.transactionType === userInput.type

            )

            .map((x, index) => ({

                No: index + 1,

                ...x

            }));



        const total = transactions.reduce(

            (sum, x) => sum + Number(x.amount || 0),

            0

        );



        newPage.document.write(`

        <html>

        <head>

        <title>
            Transaction Report
        </title>


        <style>

            body {

                font-family: Arial;

                padding:20px;

            }


            table {

                border-collapse:collapse;

                width:100%;

            }


            th,td {

                border:1px solid #ccc;

                padding:8px;

            }


            th {

                background:#f2f2f2;

            }


        </style>


        </head>


        <body>


        <h2>
            ${userInput.type}
        </h2>


        <h3>
            Wallet ID: ${userInput.wallet}
        </h3>


        <h3>
            Date Range: ${userInput.fromDate} - ${userInput.toDate}
        </h3>


        <h3>
            Total Transaction: ${transactions.length}
        </h3>


        <h3>
            Total Amount: RM ${total.toFixed(2)}
        </h3>


        <br>


        <table>


        <tr>

            <th>No</th>
            <th>ID</th>
            <th>Date</th>
            <th>Status</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Wallet</th>
            <th>Merchant</th>
            <th>Channel</th>
            <th>Transaction ID</th>

        </tr>



        ${transactions.map(x => `

        <tr>

            <td>${x.No}</td>

            <td>${x.id}</td>

            <td>${x.transactionDate}</td>

            <td>${x.transactionStatus}</td>

            <td>${x.transactionType}</td>

            <td>${x.amount}</td>

            <td>${x.walletId}</td>

            <td>${x.merchantName || "-"}</td>

            <td>${x.channelType || "-"}</td>

            <td>${x.transactionId}</td>

        </tr>


        `).join("")}


        </table>


        </body>

        </html>


        `);



        newPage.document.close();



    } catch(error) {


        newPage.document.write(`

            <h2>Error loading report</h2>

            <pre>${error}</pre>

        `);


        newPage.document.close();

    }


})();
