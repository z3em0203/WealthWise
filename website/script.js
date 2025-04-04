// Constants
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const DB_NAME = "AusgabenDB";
const DB_VERSION = 6;

// Database configuration
const DB_CONFIG = {
    expenses: {
        keyPath: "id",
        autoIncrement: true,
        indexes: [
            { name: "year", unique: false },
            { name: "month", unique: false },
            { name: "amount", unique: false },
            { name: "note", unique: false }
        ]
    },
    dauerauftraege: {
        keyPath: "id",
        autoIncrement: true,
        indexes: [
            { name: "startYear", unique: false },
            { name: "startMonth", unique: false },
            { name: "endYear", unique: false },
            { name: "endMonth", unique: false },
            { name: "amount", unique: false },
            { name: "note", unique: false }
        ]
    },
    income: {
        keyPath: ["year", "month"],
        indexes: [
            { name: "year", unique: false },
            { name: "month", unique: false }
        ]
    }
};

// Data storage
let data = { expenses: [], dauerauftraege: [], income: [] };

// User identification
const userId = 'user123'; // Replace with dynamic user identification logic

// Fetch data from the server
const fetchData = async () => {
    try {
        const response = await fetch(`http://${window.location.hostname}:8080/api/data?userId=${userId}`);
        data = await response.json();
        await initializeApp();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// Save data to the server
const saveData = async () => {
    try {
        await fetch(`http://${window.location.hostname}:8080/api/data?userId=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

const dbOperations = {
    async add(storeName, item) {
        if (storeName === 'income') {
            // Handle income as an object
            const [key, value] = Object.entries(item)[0]; // Extract the key-value pair
            data[storeName][key] = value; // Add the key-value pair to the income object
        } else {
            // Default behavior for other stores (arrays)
            data[storeName].push(item);
        }
        await saveData();
        return item;
    },
    async delete(storeName, id) {
        data[storeName] = data[storeName].filter(item => item.id !== id);
        await saveData();
    },
    async getAll(storeName) {
        return data[storeName];
    },
    async get(storeName, key) {
        if (storeName === 'income') {
            // Handle income as an object
            return data[storeName][key] || null;
        }
        // Default behavior for other stores
        return data[storeName].find(item => item.id === key);
    },
    async update(storeName, id, updatedItem) {
        if (storeName === 'income') {
            // Handle income as an object
            data[storeName][id] = updatedItem;
        } else {
            // Default behavior for other stores (arrays)
            const index = data[storeName].findIndex(item => item.id === id);
            if (index !== -1) {
                data[storeName][index] = updatedItem;
            }
        }
        await saveData();
    }
};

// Utility functions
const formatCurrency = (amount) => `€${amount.toFixed(2)}`;
const convertToNumber = (year, month) => {
    const monthMapping = Object.fromEntries(MONTHS.map((month, index) => [month, index + 1]));
    return parseInt(year, 10) * 100 + monthMapping[month];
};

// DOM Helper functions
const getElement = (id) => {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id '${id}' not found`);
    }
    return element;
};

const setElementValue = (id, value) => {
    const element = getElement(id);
    if (element) {
        element.value = value;
    }
};

const setElementText = (id, text) => {
    const element = getElement(id);
    if (element) {
        element.textContent = text;
    }
};

// Year and Month Population Functions
const populateYearSelect = (selectId, startYear = 2025) => {
    const select = getElement(selectId);
    if (!select) return;

    const currentYear = new Date().getFullYear();
    select.innerHTML = '';
    
    for (let year = startYear; year <= currentYear + 3; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    }
};

const populateMonthSelect = (selectId) => {
    const select = getElement(selectId);

    if (!select) return;

    const currentMonth = MONTHS[new Date().getMonth()]; // Get the current month
    select.innerHTML = MONTHS.map(month => 
        `<option value="${month}" ${month === currentMonth ? 'selected' : ''}>${month}</option>`
    ).join('');
  
};

const populateAllSelectors = () => {
    // Populate year selectors
    populateYearSelect('year');
    populateYearSelect('dStartYear');
    populateYearSelect('dEndYear');

    // Populate month selectors
    populateMonthSelect('month');
    populateMonthSelect('dStartMonth');
    populateMonthSelect('dEndMonth');

    // Set current year and month as default
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = MONTHS[now.getMonth()];

    setElementValue('year', currentYear);
    setElementValue('dStartYear', currentYear);
    setElementValue('dEndYear', currentYear);

    setElementValue('month', currentMonth);
    setElementValue('dStartMonth', currentMonth);
    setElementValue('dEndMonth', currentMonth);
};

// Animation Control
function initAnimations() {
    // Add visible class to sections when they come into view
    const sections = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in, .card-enter, .fade-in-up');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    // Add hover effects to cards
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('hover-lift');
    });

    // Add pulse effect to primary buttons
    document.querySelectorAll('button.primary').forEach(button => {
        button.classList.add('btn-pulse');
    });
}

// Update list item animations
function animateListItem(element) {
    element.classList.add('list-item');
    setTimeout(() => {
        element.classList.add('visible');
    }, 10);
}

// Update existing functions to use animations
function addExpenseToList(expense) {
    const li = document.createElement('li');
    li.className = 'flex items-center p-4 bg-gray-700/50 rounded-lg list-item hover:bg-gray-700/70 transition-colors duration-200 border border-gray-600/50';
    li.innerHTML = `
        <div class="flex items-center gap-4 w-full">
            <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div class="flex-grow">
                <div class="flex items-center gap-2">
                    <span class="text-red-400 font-medium text-lg">${formatCurrency(expense.amount)}</span>
                </div>
                <div class="text-gray-300 text-sm mt-1">${expense.note}</div>
            </div>
            <div class="flex gap-2">
                <button onclick="openEditExpenseModal(${expense.id})" class="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:bg-gray-600/50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button onclick="handleDeleteExpense(${expense.id})" class="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200 hover:bg-gray-600/50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    `;
    animateListItem(li);
}

function addDauerauftragToList(dauerauftrag) {
    const li = document.createElement('li');
    li.className = 'flex items-center p-4 bg-gray-700/50 rounded-lg list-item hover:bg-gray-700/70 transition-colors duration-200 border border-gray-600/50';
    li.innerHTML = `
        <div class="flex items-center gap-4 w-full">
            <div class="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </div>
            <div class="flex-grow">
                <div class="flex items-center gap-2">
                    <span class="text-purple-400 font-medium text-lg">${formatCurrency(dauerauftrag.amount)}</span>
                    <span class="text-gray-400 text-sm">pro Monat</span>
                </div>
                <div class="text-gray-300 text-sm mt-1">${dauerauftrag.note}</div>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-gray-400 text-xs bg-gray-600/50 px-2 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        ${dauerauftrag.startMonth} ${dauerauftrag.startYear} - ${dauerauftrag.endMonth} ${dauerauftrag.endYear}
                    </span>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="openEditDauerauftragModal(${dauerauftrag.id})" class="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:bg-gray-600/50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button onclick="handleDeleteDauerauftrag(${dauerauftrag.id})" class="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200 hover:bg-gray-600/50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    `;
    animateListItem(li);
}

// Business Logic
const loadMonths = () => {
    const yearSelect = getElement("year");
    const monthSelect = getElement("month");
    
    if (!yearSelect || !monthSelect) return;
    
    const year = yearSelect.value;
    monthSelect.innerHTML = "";
    
    MONTHS.forEach(month => {
        const option = document.createElement("option");
        option.value = `${month}`;
        option.textContent = month;

        monthSelect.appendChild(option);
    });

    const now = new Date();
    if (now.getFullYear().toString() === year) {
        const currentMonthName = MONTHS[now.getMonth()];
        monthSelect.value = `${currentMonthName}`;
    } else {
        monthSelect.selectedIndex = 0;
    }

    // Load expenses and recurring payments when month changes
    loadExpenses();
    loadDauerauftraege();
    loadIncomeForYearAndMonth();
};

const loadModalMonths = () => {
    const dStartMonthSelect = getElement("dStartMonth");
    const dEndMonthSelect = getElement("dEndMonth");
    const dStartYearSelect = getElement("dStartYear");
    const dEndYearSelect = getElement("dEndYear");
    
    if (!dStartMonthSelect || !dEndMonthSelect || !dStartYearSelect || !dEndYearSelect) return;
    
    // Set current year and month as default start
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = MONTHS[now.getMonth()];
    
    // Set start date to current month
    dStartYearSelect.value = currentYear;
    dStartMonthSelect.value = currentMonth;
    
    // Set end date to next month
    const nextMonthIndex = (now.getMonth() + 1) % 12;
    const nextYear = nextMonthIndex === 0 ? now.getFullYear() + 1 : now.getFullYear();
    dEndYearSelect.value = nextYear.toString();
    dEndMonthSelect.value = MONTHS[nextMonthIndex];
    
    // Populate month options
    [dStartMonthSelect, dEndMonthSelect].forEach(select => {
        select.innerHTML = "";
        MONTHS.forEach(month => {
            const option = document.createElement("option");
            option.value = month;
            option.textContent = month;
            select.appendChild(option);
        });
    });
};

const loadIncomeForYearAndMonth = async () => {
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    
    try {
        const incomeKey = `${year} - ${month}`; // Construct the key in the correct format
        const income = await dbOperations.get('income', incomeKey); // Use 
        const incomeInput = document.getElementById('income');
        const incomeYearDisplay = document.getElementById('incomeYearDisplay');
         
        if (income) {
            incomeInput.value = income.amount;
            incomeYearDisplay.textContent = `${month} ${year}`;
        } else {
            incomeInput.value = '';
             incomeYearDisplay.textContent = `${month} ${year}`;
        }
        
        await calculate();
    } catch (error) {
        console.error('Error loading income:', error);
        showNotification('Fehler beim Laden des Gehalts', 'error');
    }
};

const onYearChange = () => {
    loadMonths();
    loadExpenses();
    loadDauerauftraege();
    loadIncomeForYearAndMonth();
    loadExpenseChart(); // Ensure the chart updates when the year changes
};

const onMonthChange = () => {
        loadExpenses();
        loadDauerauftraege();
    loadIncomeForYearAndMonth();
    loadExpenseChart(); // Ensure the chart updates when the month changes
};

const calculate = async () => {
    try {
        const year = document.getElementById('year').value;
        const month = document.getElementById('month').value;

    

        // Fetch income
        const incomeRecord = await dbOperations.get("income", `${year} - ${month}`);
        const income = incomeRecord ? incomeRecord.amount : 0;


        // Fetch one-time expenses
        const expenses = await dbOperations.getAll("expenses");
     

        const oneTimeTotal = expenses
            .filter(item => {
                const matches = item.year === year && item.month === month;
         
               
                return matches;
            })
            .reduce((sum, item) => sum + item.amount, 0);
     

        // Fetch recurring payments
        const recurringPayments = await dbOperations.getAll("dauerauftraege");
      
        const currentValue = convertToNumber(year, month);
        const recurringTotal = recurringPayments
            .filter(order => {
               
                const startVal = convertToNumber(order.startYear, order.startMonth);
                const endVal = convertToNumber(order.endYear, order.endMonth);
                const matches = currentValue >= startVal && currentValue <= endVal;
        
                return matches;
            })
            .reduce((sum, order) => sum + order.amount, 0);


        // Calculate totals
        const totalExpenses = oneTimeTotal + recurringTotal;
        const balance = income - totalExpenses;

 

        // Update display elements
        setElementText("incomeDisplay", formatCurrency(income));
        setElementText("expensesDisplay", formatCurrency(totalExpenses));
        setElementText("result", formatCurrency(balance));
        updateBalanceProgress(balance, income);
        await loadExpenseChart();
    } catch (error) {
        console.error("Error calculating balance:", error);
        showNotification("Fehler bei der Berechnung", "error");
    }
};

const loadExpenses = async () => {
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    if (!year & !month) return;
    
   
    try {
        const items = await dbOperations.getAll("expenses");
        const filteredItems = items.filter(item => item.year === year && item.month === month);
        filteredItems.sort((a, b) => a.amount - b.amount);
        
        const expenseList = getElement("expenseList");
        if (!expenseList) return;
        
        expenseList.innerHTML = "";
        if (filteredItems.length === 0) {
            const li = document.createElement("li");
            li.className = "text-gray-400 text-center py-6 bg-gray-700/50 rounded-lg border border-dashed border-gray-600";
            li.innerHTML = `
                <div class="flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Keine Ausgaben für diesen Monat</span>
                </div>
            `;
            expenseList.appendChild(li);
        } else {
        filteredItems.forEach(item => {
            const li = document.createElement("li");
                li.className = "flex items-center p-4 bg-gray-700/50 rounded-lg list-item hover:bg-gray-700/70 transition-colors duration-200 border border-gray-600/50";
            li.innerHTML = `
                    <div class="flex items-center gap-4 w-full">
                        <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div class="flex-grow">
                            <div class="text-red-400 font-medium text-lg">${formatCurrency(item.amount)}</div>
                            <div class="text-gray-300 text-sm">${item.note}</div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="openEditExpenseModal(${item.id})" class="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:bg-gray-600/50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button onclick="handleDeleteExpense(${item.id})" class="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200 hover:bg-gray-600/50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                        </div>
                    </div>
            `;
            expenseList.appendChild(li);
                setTimeout(() => {
                    li.classList.add('visible');
                }, 10);
        });
        }
        await calculate();
    } catch (error) {
        console.error("Error loading expenses:", error);
        showNotification("Fehler beim Laden der Ausgaben", "error");
    }
};

const loadDauerauftraege = async () => {
    const currYear = document.getElementById('year').value;
        const currMonth = document.getElementById('month').value;
    
    if (!currYear & !currMonth) return;
    

    const selectedDate = parseInt(currYear) * 100 + MONTHS.indexOf(currMonth) + 1;
    
    try {
        const allOrders = await dbOperations.getAll("dauerauftraege");
        const filteredOrders = allOrders.filter(order => {
            const startDate = parseInt(order.startYear) * 100 + MONTHS.indexOf(order.startMonth) + 1;
            const endDate = parseInt(order.endYear) * 100 + MONTHS.indexOf(order.endMonth) + 1;
            return selectedDate >= startDate && selectedDate <= endDate;
        });
        
        filteredOrders.sort((a, b) => a.amount - b.amount);
        const list = getElement("dauerauftragList");
        if (!list) return;
        
        list.innerHTML = "";
        if (filteredOrders.length === 0) {
            const li = document.createElement("li");
            li.className = "text-gray-400 text-center py-6 bg-gray-700/50 rounded-lg border border-dashed border-gray-600";
            li.innerHTML = `
                <div class="flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Keine Daueraufträge für diesen Monat</span>
                </div>
            `;
            list.appendChild(li);
        } else {
        filteredOrders.forEach(order => {
            const li = document.createElement("li");
                li.className = "flex items-center p-4 bg-gray-700/50 rounded-lg list-item hover:bg-gray-700/70 transition-colors duration-200 border border-gray-600/50";
            li.innerHTML = `
                    <div class="flex items-center gap-4 w-full">
                        <div class="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <div class="flex-grow">
                            <div class="flex items-center gap-2">
                                <span class="text-purple-400 font-medium text-lg">${formatCurrency(order.amount)}</span>
                                <span class="text-gray-400 text-sm">pro Monat</span>
                            </div>
                            <div class="text-gray-300 text-sm mt-1">${order.note}</div>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="text-gray-400 text-xs bg-gray-600/50 px-2 py-1 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    ${order.startMonth} ${order.startYear} - ${order.endMonth} ${order.endYear}
                </span>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="openEditDauerauftragModal(${order.id})" class="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:bg-gray-600/50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button onclick="handleDeleteDauerauftrag(${order.id})" class="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200 hover:bg-gray-600/50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                        </div>
                    </div>
            `;
            list.appendChild(li);
                setTimeout(() => {
                    li.classList.add('visible');
                }, 10);
        });
        }
        calculate();
    } catch (error) {
        console.error("Error loading recurring payments:", error);
        showNotification("Fehler beim Laden der Daueraufträge", "error");
    }
};

// Event Handlers
const handleAddExpense = async () => {
    const addButton = document.querySelector('#addExpenseButton');
    if (addButton) {
        addButton.className = 'flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200 border border-red-500/20';
    }

    const expense = parseFloat(getElement("expense").value);
    const note = getElement("note").value.trim();
        const selected = getElement("month").value;
    
    if (!selected) {
        showNotification("Bitte wähle einen Monat aus.", "error");
        return;
    }
    
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    
    if (isNaN(expense) || expense <= 0 || note === "") {
        showNotification("Bitte gib gültige Ausgabedaten ein.", "error");
        return;
    }
    
    try {
        await dbOperations.add("expenses", { amount: expense, note, year, month });
        await loadExpenses();
        await calculate();
        showNotification("Ausgabe erfolgreich hinzugefügt!");
        setElementValue("expense", "");
        setElementValue("note", "");
    } catch (error) {
        console.error("Error adding expense:", error);
        showNotification("Fehler beim Hinzufügen der Ausgabe", "error");
    }
};

const showConfirmationModal = (message, onConfirm) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg w-full max-w-md scale-in">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-white">Bestätigung</h2>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <p class="text-gray-300 mb-6">${message}</p>
            <div class="flex justify-end gap-3">
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200">
                    Abbrechen
                </button>
                <button onclick="this.closest('.fixed').remove(); ${onConfirm}" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200">
                    Löschen
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
        modal.querySelector('.scale-in').classList.add('visible');
    }, 10);
};

const handleDeleteExpense = async (id) => {
    showConfirmationModal(
        'Möchtest du diese Ausgabe wirklich löschen?',
        `handleDeleteExpenseConfirmed(${id})`
    );
};

const handleDeleteExpenseConfirmed = async (id) => {
    try {
        await dbOperations.delete("expenses", id);
        await loadExpenses();
        await calculate();
        showNotification("Ausgabe erfolgreich gelöscht!");
    } catch (error) {
        console.error("Error deleting expense:", error);
        showNotification("Fehler beim Löschen der Ausgabe", "error");
    }
};

const handleAddDauerauftrag = async () => {
    const amount = parseFloat(getElement("dAmount").value);
    const note = getElement("dNote").value;
    const startYear = getElement("dStartYear").value;
    const startMonth = getElement("dStartMonth").value;
    const endYear = getElement("dEndYear").value;
    const endMonth = getElement("dEndMonth").value;
    
    if (isNaN(amount) || amount <= 0 || note === "") {
        showNotification("Bitte gib gültige Dauerauftragsdaten ein.", "error");
        return;
    }

    // Validate time period
    const startVal = convertToNumber(startYear, startMonth);
    const endVal = convertToNumber(endYear, endMonth);
    
    if (startVal > endVal) {
        showNotification("Das Enddatum muss nach dem Startdatum liegen.", "error");
        return;
    }
    
    try {
        await dbOperations.add("dauerauftraege", {
            amount,
            note,
            startYear,
            startMonth,
            endYear,
            endMonth
        });
        
        await loadDauerauftraege();
        await calculate();
        closeModal();
        showNotification("Dauerauftrag erfolgreich hinzugefügt!");
        setElementValue("dAmount", "");
        setElementValue("dNote", "");
    } catch (error) {
        console.error("Error adding recurring payment:", error);
        showNotification("Fehler beim Hinzufügen des Dauerauftrags", "error");
    }
};

const handleDeleteDauerauftrag = async (id) => {
    showConfirmationModal(
        'Möchtest du diesen Dauerauftrag wirklich löschen?',
        `handleDeleteDauerauftragConfirmed(${id})`
    );
};

const handleDeleteDauerauftragConfirmed = async (id) => {
    try {
        await dbOperations.delete("dauerauftraege", id);
        await loadDauerauftraege();
        await calculate();
        showNotification("Dauerauftrag erfolgreich gelöscht!");
    } catch (error) {
        console.error("Error deleting recurring payment:", error);
        showNotification("Fehler beim Löschen des Dauerauftrags", "error");
    }
};

const handleSaveIncome = async () => {
    const income = parseFloat(document.getElementById('income').value);
    const year = parseInt(document.getElementById('year').value, 10);
    const month = `${document.getElementById('month').value}`; // Ensure key format matches saved data

    if (isNaN(income) || income <= 0) {
        showNotification("Bitte gib einen gültigen Einkommensbetrag ein", "error");
        return;
    }

    try {
    
        const existingIncome = await dbOperations.get('income', `${year} - ${month}`); // Use the constructed key
        console.log('Existing income:', existingIncome);
        if (existingIncome) {
            // Update existing record
          // Update existing recordc

existingIncome.amount = income;
await dbOperations.update('income', `${year} - ${month}`, existingIncome);
        } else {
            // Add new record
            const incomeKey = `${year} - ${month}`;
            await dbOperations.add('income', {
                [incomeKey]: {
                    amount: income
                }
            });
        }

        await calculate();
        showNotification('Einkommen erfolgreich gespeichert');
    } catch (error) {
        console.error('Error saving income:', error);
        showNotification('Fehler beim Speichern des Einkommens', 'error');
    }
};

// Neue Funktionen für die Bearbeitung
const openEditExpenseModal = async (id) => {
    try {
        const expense = await dbOperations.get("expenses", id);
        if (!expense) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 p-6 rounded-lg w-full max-w-md scale-in">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-white">Ausgabe bearbeiten</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Betrag</label>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                            <input type="number" step="0.01" id="editExpenseAmount" value="${expense.amount}" class="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Notiz</label>
                        <input type="text" id="editExpenseNote" value="${expense.note}" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="flex justify-end gap-2">
                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200">Abbrechen</button>
                        <button onclick="handleEditExpense(${id})" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">Speichern</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => {
            modal.querySelector('.scale-in').classList.add('visible');
        }, 10);
    } catch (error) {
        console.error("Error opening edit modal:", error);
        showNotification("Fehler beim Öffnen des Bearbeitungsfensters", "error");
    }
};

const openEditDauerauftragModal = async (id) => {
    try {
        const order = await dbOperations.get("dauerauftraege", id);
        if (!order) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 p-6 rounded-lg w-full max-w-md scale-in">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-white">Dauerauftrag bearbeiten</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Betrag</label>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                            <input type="number" step="0.01" id="editDauerauftragAmount" value="${order.amount}" class="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Notiz</label>
                        <input type="text" id="editDauerauftragNote" value="${order.note}" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Start Monat</label>
                            <select id="editDauerauftragStartMonth" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                ${MONTHS.map(month => `<option value="${month}" ${month === order.startMonth ? 'selected' : ''}>${month}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Start Jahr</label>
                            <select id="editDauerauftragStartYear" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                ${Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => 
                                    `<option value="${year}" ${year.toString() === order.startYear ? 'selected' : ''}>${year}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Ende Monat</label>
                            <select id="editDauerauftragEndMonth" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                ${MONTHS.map(month => `<option value="${month}" ${month === order.endMonth ? 'selected' : ''}>${month}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Ende Jahr</label>
                            <select id="editDauerauftragEndYear" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                ${Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => 
                                    `<option value="${year}" ${year.toString() === order.endYear ? 'selected' : ''}>${year}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200">Abbrechen</button>
                        <button onclick="handleEditDauerauftrag(${id})" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">Speichern</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => {
            modal.querySelector('.scale-in').classList.add('visible');
        }, 10);
    } catch (error) {
        console.error("Error opening edit modal:", error);
        showNotification("Fehler beim Öffnen des Bearbeitungsfensters", "error");
    }
};

const handleEditExpense = async (id) => {
    try {
        const amount = parseFloat(getElement("editExpenseAmount").value);
        const note = getElement("editExpenseNote").value.trim();
        
        if (isNaN(amount) || amount <= 0 || note === "") {
            showNotification("Bitte gib gültige Daten ein", "error");
            return;
        }
        
        const expense = await dbOperations.get("expenses", id);
        if (!expense) return;
        
        expense.amount = amount;
        expense.note = note;
        
        await dbOperations.update("expenses", id, expense);
        await loadExpenses();
        await calculate();
        
        document.querySelector('.fixed').remove();
        showNotification("Ausgabe erfolgreich bearbeitet");
    } catch (error) {
        console.error("Error editing expense:", error);
        showNotification("Fehler beim Bearbeiten der Ausgabe", "error");
    }
};

const handleEditDauerauftrag = async (id) => {
    try {
        const amount = parseFloat(getElement("editDauerauftragAmount").value);
        const note = getElement("editDauerauftragNote").value.trim();
        const startMonth = getElement("editDauerauftragStartMonth").value;
        const startYear = getElement("editDauerauftragStartYear").value;
        const endMonth = getElement("editDauerauftragEndMonth").value;
        const endYear = getElement("editDauerauftragEndYear").value;
        
        if (isNaN(amount) || amount <= 0 || note === "") {
            showNotification("Bitte gib gültige Daten ein", "error");
            return;
        }
        
        const order = await dbOperations.get("dauerauftraege", id);
        if (!order) return;
        
        order.amount = amount;
        order.note = note;
        order.startMonth = startMonth;
        order.startYear = startYear;
        order.endMonth = endMonth;
        order.endYear = endYear;
        
        await dbOperations.update("dauerauftraege", id, order);
        await loadDauerauftraege();
        await calculate();
        
        document.querySelector('.fixed').remove();
        showNotification("Dauerauftrag erfolgreich bearbeitet");
    } catch (error) {
        console.error("Error editing recurring payment:", error);
        showNotification("Fehler beim Bearbeiten des Dauerauftrags", "error");
    }
};

// Update modal animations
const openModal = () => {
    const modal = getElement('recurringModal');
    if (modal) {
        modal.classList.add('show');
        setTimeout(() => {
            modal.querySelector('.scale-in').classList.add('visible');
        }, 10);
        loadModalMonths();
    }
};

const closeModal = () => {
    const modal = getElement('recurringModal');
    if (modal) {
        modal.querySelector('.scale-in').classList.remove('visible');
        setTimeout(() => {
            modal.classList.remove('show');
        }, 300);
    }
};

// Add loading animation to buttons during operations
const showLoading = (button) => {
    const originalContent = button.innerHTML;
    button.innerHTML = `
        <div class="loading-spinner"></div>
    `;
    button.disabled = true;
    return originalContent;
};

const hideLoading = (button, originalContent) => {
    button.innerHTML = originalContent;
    button.disabled = false;
};

// Update notification animation
const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `fixed right-4 z-50 transform transition-all duration-300 translate-x-full opacity-0`;
    
    // Calculate position based on existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    const topPosition = existingNotifications.length * 80 + 20; // 80px height per notification + 20px initial offset
    
    notification.style.top = `${topPosition}px`;
    notification.classList.add('notification');
    
    const icon = type === "success" ? 
        `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>` :
        `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>`;

    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
    const textColor = "text-white";
    const borderColor = type === "success" ? "border-green-600" : "border-red-600";

    notification.innerHTML = `
        <div class="flex items-center gap-4 ${bgColor} ${textColor} border-2 ${borderColor} px-6 py-4 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-200">
            <div class="flex-shrink-0">
                ${icon}
            </div>
            <div class="flex-grow">
                <p class="font-medium text-lg">${message}</p>
            </div>
            <button onclick="this.closest('.notification').remove()" class="flex-shrink-0 text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
        notification.classList.remove("translate-x-full", "opacity-0");
        notification.classList.add("translate-x-0", "opacity-100");
    });

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.add("translate-x-full", "opacity-0");
        setTimeout(() => {
            // Ensure the node exists before attempting to remove it
if (notification.parentNode) {
    notification.parentNode.removeChild(notification);
}
        }, 300);
    }, 5000);
};

// Add shake animation for invalid inputs
const shakeElement = (element) => {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
};




// Initialize application
const initializeApp = async () => {
    populateAllSelectors();
    loadMonths();
     loadExpenses();
     loadDauerauftraege();
    initAnimations();
    loadExpenseChart();

    // Style the add expense button
    const addButton = document.querySelector('#addExpenseButton');
    if (addButton) {
        addButton.className = 'flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200 border border-red-500/20';
    }
};

// Start the application
document.addEventListener('DOMContentLoaded', fetchData);

// Overview view function
const showOverview = () => {
    const overviewSection = document.getElementById('overviewSection');
    const insightsSection = document.getElementById('insightsSection');
    
    if (overviewSection && insightsSection) {
        overviewSection.classList.remove('hidden');
        insightsSection.classList.add('hidden');
        
        // Add animation classes
        overviewSection.classList.add('fade-in');
        setTimeout(() => {
            overviewSection.classList.add('visible');
        }, 10);
    }
};


const loadExpenseChart = async () => {
    try {
        const selectedYear = parseInt(getElement("year").value, 10);
        const expenses = await dbOperations.getAll("expenses");
        const dauerauftraege = await dbOperations.getAll("dauerauftraege");

        // Initialize monthly sums for each month
        const monthlySums = Array(12).fill(0);

        // Add expenses to monthly sums
        expenses.forEach(expense => {
            const expenseYear = parseInt(expense.year, 10);
            const expenseMonth = MONTHS.indexOf(expense.month);
            if (expenseYear === selectedYear) {
                monthlySums[expenseMonth] += expense.amount;
            }
        });

        // Add recurring payments to monthly sums
        dauerauftraege.forEach(order => {
            const startYear = parseInt(order.startYear, 10);
            const startMonth = MONTHS.indexOf(order.startMonth);
            const endYear = parseInt(order.endYear, 10);
            const endMonth = MONTHS.indexOf(order.endMonth);

            for (
                let year = startYear, month = startMonth;
                year < endYear || (year === endYear && month <= endMonth);
                month++
            ) {
                if (month >= 12) {
                    month = 0;
                    year++;
                }
                if (year === selectedYear) {
                    monthlySums[month] += order.amount;
                }
            }
        });

        // Prepare labels and data for the chart
        const labels = MONTHS;
        const data = monthlySums;

        // Get the canvas element
        const canvas = document.getElementById("expenseChart");
        if (!canvas) {
            console.error("Canvas element with id 'expenseChart' not found.");
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            console.error("Failed to get 2D context for the canvas.");
            return;
        }

        // Create gradient for the chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(1, "rgba(241, 50, 50, 0.8)");
        gradient.addColorStop(0, "rgba(117, 6, 6, 0.8)");

        // Create or update the chart
        if (canvas.expenseChart) {
            canvas.expenseChart.data.labels = labels;
            canvas.expenseChart.data.datasets[0].data = data;
            canvas.expenseChart.update();
        } else {
            canvas.expenseChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: `Gesamtausgaben für ${selectedYear} (€)`,
                            data,
                            backgroundColor: gradient,
                            borderColor: "rgba(255, 255, 255, 0.8)",
                            borderWidth: 0,
                            borderRadius: 15, // Rounded bar edges
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => `€${context.raw.toFixed(2)}`,
                            },
                        },
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: "#ffffff",
                            },
                            grid: {
                                color: "rgba(255, 255, 255, 0.1)",
                            },
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: "#ffffff",
                            },
                            grid: {
                                color: "rgba(255, 255, 255, 0.1)",
                            },
                        },
                    },
                },
            });
        }
    } catch (error) {
        console.error("Error loading expense chart:", error);
        showNotification("Fehler beim Laden des Diagramms", "error");
    }
};
// Export functions for HTML event handlers
window.handleAddExpense = handleAddExpense;
window.handleDeleteExpense = handleDeleteExpense;
window.handleAddDauerauftrag = handleAddDauerauftrag;
window.handleDeleteDauerauftrag = handleDeleteDauerauftrag;
window.handleSaveIncome = handleSaveIncome;
window.openModal = openModal;
window.closeModal = closeModal;
window.onYearChange = onYearChange;
window.onMonthChange = onMonthChange;
window.loadMonths = loadMonths;
window.loadModalMonths = loadModalMonths;
window.calculate = calculate;
window.showNotification = showNotification;
window.showOverview = showOverview;
window.showOverview = showOverview;
window.loadExpenses = loadExpenses;
window.loadDauerauftraege = loadDauerauftraege;
window.loadExpenseChart = loadExpenseChart;





let incomeData = {}; // Objekt zur Speicherung des Einkommens nach Jahr und Monat


function updateBalanceProgress(balance, income) {
  const positiveBalanceProgress = document.getElementById('positiveBalanceProgress');
  const negativeBalanceProgress = document.getElementById('negativeBalanceProgress');
  
  const positivePercentage = balance > 0 && income > 0 ? Math.min((balance / income) * 100, 100) : 0;
  const negativePercentage = 100 - positivePercentage;

  positiveBalanceProgress.style.width = `${positivePercentage}%`;
  negativeBalanceProgress.style.width = `${negativePercentage}%`;

  // Ensure the animation class is applied and removed correctly
  [positiveBalanceProgress, negativeBalanceProgress].forEach((bar) => {
    bar.classList.remove('animate-pulse');
    void bar.offsetWidth; // Trigger reflow to restart the animation
    bar.classList.add('animate-pulse');
  });
}



