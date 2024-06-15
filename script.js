document.addEventListener('DOMContentLoaded', () => {
    
    loadSummary();
});


let currentEditIndex = null;

function createParty() {
    const partyName = document.getElementById('partyName').value;
    if (partyName) {
        let parties = JSON.parse(localStorage.getItem('parties')) || [];
        parties.push({ name: partyName, transactions: [] });
        localStorage.setItem('parties', JSON.stringify(parties));
        document.getElementById('partyName').value = '';
        loadParties();
        loadSummary();
    }
}






function loadParties() {
    const partiesList = document.getElementById('partiesList');
    partiesList.innerHTML = '';
    let parties = JSON.parse(localStorage.getItem('parties')) || [];
    parties.forEach((party, index) => {
        let partyItem = document.createElement('div');
        partyItem.innerHTML = `<button onclick="viewParty(${index})">${party.name}</button>`;
       
    });
}







function viewParty(index) {
    let parties = JSON.parse(localStorage.getItem('parties'));
    let party = parties[index];
    document.getElementById('partyTitle').innerText = party.name;
    document.getElementById('partyDetails').classList.remove('hidden');
    document.getElementById('partiesList').classList.add('hidden');
    document.getElementById('currentPartyIndex').value = index;
    loadTransactions(index);
}







function goBack() {
    document.getElementById('partyDetails').classList.add('hidden');
    document.getElementById('partiesList').classList.remove('hidden');
    loadSummary();
}







function loadTransactions(index) {
    const transactionsTable = document.querySelector('#ledgerTable tbody');
    transactionsTable.innerHTML = '';
    let parties = JSON.parse(localStorage.getItem('parties'));
    let transactions = parties[index].transactions;
    let runningBalance = 0;
    transactions.forEach((transaction, transactionIndex) => {
        runningBalance += (parseFloat(transaction.credit) || 0) - (parseFloat(transaction.debit) || 0);
        let transactionRow = document.createElement('tr');
        transactionRow.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.transactionNumber}</td>
            <td>${transaction.description}</td>
            <td>${transaction.credit ? transaction.credit.toFixed(2) : ''}</td>
            <td>${transaction.debit ? transaction.debit.toFixed(2) : ''}</td>
            <td>${runningBalance.toFixed(2)}</td>
            <td class="action-column"><button onclick="editTransaction(${transactionIndex})">Edit</button> <button onclick="deleteTransaction(${transactionIndex})">Delete</button></td>
        `;
        transactionsTable.appendChild(transactionRow);
    });
}








function addTransaction() {
    const date = document.getElementById('transactionDate').value;
    const transactionNumber = document.getElementById('transactionNumber').value;
    const description = document.getElementById('transactionDescription').value;
    const credit = parseFloat(document.getElementById('transactionCredit').value) || 0;
    const debit = parseFloat(document.getElementById('transactionDebit').value) || 0;
    
    if (date && (credit || debit)) {
        let index = document.getElementById('currentPartyIndex').value;
        let parties = JSON.parse(localStorage.getItem('parties'));

        if (currentEditIndex !== null) {
            parties[index].transactions[currentEditIndex] = { date, transactionNumber, description, credit, debit };
            currentEditIndex = null;
        } else {
            parties[index].transactions.push({ date, transactionNumber, description, credit, debit });
        }

        localStorage.setItem('parties', JSON.stringify(parties));
        document.getElementById('transactionDate').value = '';
        document.getElementById('transactionNumber').value = '';
        document.getElementById('transactionDescription').value = '';
        document.getElementById('transactionCredit').value = '';
        document.getElementById('transactionDebit').value = '';
        loadTransactions(index);
        loadSummary();
    }
}








function loadTransactions(index) {
    const transactionsTable = document.querySelector('#ledgerTable tbody');
    transactionsTable.innerHTML = '';
    let parties = JSON.parse(localStorage.getItem('parties'));
    let transactions = parties[index].transactions;
    let runningBalance = 0;
    transactions.forEach((transaction, transactionIndex) => {
        runningBalance += (parseFloat(transaction.credit) || 0) - (parseFloat(transaction.debit) || 0);
        let transactionRow = document.createElement('tr');
        transactionRow.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.transactionNumber}</td>
            <td>${transaction.description}</td>
            <td>${transaction.credit ? transaction.credit.toFixed(2) : ''}</td>
            <td>${transaction.debit ? transaction.debit.toFixed(2) : ''}</td>
            <td>${runningBalance.toFixed(2)}</td>
            <td class="action-column"><button onclick="editTransaction(${transactionIndex})">Edit</button> <button onclick="deleteTransaction(${transactionIndex})">Delete</button></td>
        `;
        transactionsTable.appendChild(transactionRow);
    });
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
}










function deleteLastTransaction() {
    const index = document.getElementById('currentPartyIndex').value;
    let parties = JSON.parse(localStorage.getItem('parties'));
    let party = parties[index];

    if (party.transactions.length > 0) {
        party.transactions.pop(); // Remove the last transaction
        localStorage.setItem('parties', JSON.stringify(parties)); // Update local storage
        loadTransactions(index); // Reload transactions to update the table
        loadSummary(); // Update the summary
    }
}









function editTransaction(transactionIndex) {
    let index = document.getElementById('currentPartyIndex').value;
    let parties = JSON.parse(localStorage.getItem('parties'));
    let transaction = parties[index].transactions[transactionIndex];

    document.getElementById('transactionDate').value = transaction.date;
    document.getElementById('transactionNumber').value = transaction.transactionNumber;
    document.getElementById('transactionDescription').value = transaction.description;
    document.getElementById('transactionCredit').value = transaction.credit;
    document.getElementById('transactionDebit').value = transaction.debit;

    currentEditIndex = transactionIndex;
}








function deleteTransaction(transactionIndex) {
    let index = document.getElementById('currentPartyIndex').value;
    let parties = JSON.parse(localStorage.getItem('parties'));
    parties[index].transactions.splice(transactionIndex, 1);
    localStorage.setItem('parties', JSON.stringify(parties));
    loadTransactions(index);
    loadSummary();
}








function deleteParty() {
    let index = document.getElementById('currentPartyIndex').value;
    let parties = JSON.parse(localStorage.getItem('parties'));
    parties.splice(index, 1);
    localStorage.setItem('parties', JSON.stringify(parties));
    document.getElementById('partyDetails').classList.add('hidden');
    document.getElementById('partiesList').classList.remove('hidden');
    loadParties();
    loadSummary();
}









function loadSummary() {
    const summaryTable = document.querySelector('#summaryTable tbody');
    summaryTable.innerHTML = '';
    let parties = JSON.parse(localStorage.getItem('parties')) || [];
    let grandTotalCredit = 0;
    let grandTotalDebit = 0;
    let grandTotalBalance = 0;

    parties.forEach((party, index) => {
        let totalCredit = 0;
        let totalDebit = 0;
        let balance = 0;

        party.transactions.forEach(transaction => {
            totalCredit += parseFloat(transaction.credit) || 0;
            totalDebit += parseFloat(transaction.debit) || 0;
        });

        balance = totalCredit - totalDebit;
        grandTotalCredit += totalCredit;
        grandTotalDebit += totalDebit;
        grandTotalBalance += balance;

        let summaryRow = document.createElement('tr');
        summaryRow.innerHTML = `
            <td><button onclick="viewParty(${index})">${party.name}</button></td>
            <td>${totalCredit.toFixed(2)}</td>
            <td>${totalDebit.toFixed(2)}</td>
            <td>${balance.toFixed(2)}</td>
        `;
        summaryTable.appendChild(summaryRow);
    });

    document.getElementById('grandTotalCredit').innerText = grandTotalCredit.toFixed(2);
    document.getElementById('grandTotalDebit').innerText = grandTotalDebit.toFixed(2);
    document.getElementById('grandTotalBalance').innerText = grandTotalBalance.toFixed(2);
}







function applyFilters() {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const index = document.getElementById('currentPartyIndex').value;
  let parties = JSON.parse(localStorage.getItem('parties'));
  let party = parties[index];

  // Filter transactions based on fromDate and toDate
  let filteredTransactions = party.transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (fromDate ? transactionDate >= new Date(fromDate) : true) && (toDate ? transactionDate <= new Date(toDate) : true);
  });

  // Update the ledger table with filtered transactions
  const transactionsTable = document.querySelector('#ledgerTable tbody');
  transactionsTable.innerHTML = '';  // Clear existing data

  let runningBalance = 0; // Initialize running balance

  // Calculate running balance for each filtered transaction
  filteredTransactions.forEach((transaction, transactionIndex) => {
    // Calculate running balance up to the current transaction's date
    const currentRowDate = new Date(transaction.date);
    const transactionsBeforeCurrentRow = party.transactions.filter(transaction => new Date(transaction.date) <= currentRowDate);
    runningBalance = transactionsBeforeCurrentRow.reduce((acc, transaction) => {
      return acc + (parseFloat(transaction.credit) || 0) - (parseFloat(transaction.debit) || 0);
    }, 0);

    let transactionRow = document.createElement('tr');
    transactionRow.innerHTML = `
      <td>${transaction.date}</td>
      <td>${transaction.transactionNumber}</td>
      <td>${transaction.description}</td>
      <td>${transaction.credit ? transaction.credit.toFixed(2) : ''}</td>
      <td>${transaction.debit ? transaction.debit.toFixed(2) : ''}</td>
      <td>${runningBalance.toFixed(2)}</td> 
      <td><button onclick="editTransaction(${transactionIndex})">Edit</button> <button onclick="deleteTransaction(${transactionIndex})">Delete</button></td>
    `;
    transactionsTable.appendChild(transactionRow);
  });
}








function printAllLedgers() {
    let printContents = document.getElementById('summaryTable').outerHTML;
    let originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    loadParties();
    loadSummary();
}









function exportAllLedgersToCSV() {
    let csv = [];
    let rows = document.querySelectorAll("#summaryTable tr");

    for (let row of rows) {
        let cols = row.querySelectorAll("td, th");
        let rowData = [];
        for (let col of cols) {
            rowData.push(col.innerText);
        }
        csv.push(rowData.join(","));
    }

    let csvString = csv.join("\n");
    let blob = new Blob([csvString], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ledgers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}










async function exportAllLedgersToPDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    let table = document.getElementById("summaryTable");
    let rows = table.querySelectorAll("tr");

    let pageHeight = doc.internal.pageSize.height;
    let margin = 10;
    let y = margin;

    for (let row of rows) {
        if (y + 10 > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        let cols = row.querySelectorAll("td, th");
        let x = margin;
        for (let col of cols) {
            doc.text(col.innerText, x, y);
            x += (doc.internal.pageSize.width - 2 * margin) / cols.length;
        }
        y += 10;
    }

    doc.save("ledgers.pdf");
}









function hideActionsColumn() {
    const actionColumns = document.querySelectorAll('#ledgerTable th:last-child, #ledgerTable td:last-child');
    actionColumns.forEach(col => col.style.display = 'none');
}

function showActionsColumn() {
    const actionColumns = document.querySelectorAll('#ledgerTable th:last-child, #ledgerTable td:last-child');
    actionColumns.forEach(col => col.style.display = '');
}








function printFilteredLedger() {
    hideActionsColumn();
    let printContents = document.getElementById('ledgerTable').outerHTML;
    let originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    loadParties();
    loadSummary();
    showActionsColumn();
}











function exportFilteredLedgerToCSV() {
    hideActionsColumn();
    let csv = [];
    let rows = document.querySelectorAll("#ledgerTable tr");

    for (let row of rows) {
        let cols = row.querySelectorAll("td, th");
        let rowData = [];
        for (let col of cols) {
            if (col.style.display !== 'none') {
                rowData.push(col.innerText);
            }
        }
        csv.push(rowData.join(","));
    }

    let csvString = csv.join("\n");
    let blob = new Blob([csvString], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Party_Ledger.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showActionsColumn();
}











async function exportFilteredLedgerToPDF() {
    hideActionsColumn();
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    let table = document.getElementById("ledgerTable");
    let rows = table.querySelectorAll("tr");

    let pageHeight = doc.internal.pageSize.height;
    let margin = 10;
    let y = margin;

    for (let row of rows) {
        if (y + 10 > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        let cols = row.querySelectorAll("td, th");
        let x = margin;
        for (let col of cols) {
            if (col.style.display !== 'none') {
                doc.text(col.innerText, x, y);
                x += (doc.internal.pageSize.width - 2 * margin) / (cols.length - 1);
            }
        }
        y += 10;
    }

    doc.save("Party_Ledger.pdf");
    showActionsColumn();
}