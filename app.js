// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    // 标签切换功能
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有active类
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 添加active类到当前按钮和对应内容
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 添加行功能
    document.getElementById('add-row').addEventListener('click', addNewRow);
    
    // 保存记录功能
    document.getElementById('save-record').addEventListener('click', saveRecord);
    
    // 查询功能
    document.getElementById('search-btn').addEventListener('click', searchRecords);
    
    // 保存修改功能
    document.getElementById('save-amend').addEventListener('click', saveAmend);
    
    // 删除选中功能
    document.getElementById('delete-selected').addEventListener('click', deleteSelected);
    
    // 生成图表功能
    document.getElementById('generate-chart').addEventListener('click', generateChart);
    
    // 清除记录确认功能
    document.getElementById('confirm-input').addEventListener('input', toggleClearButton);
    document.getElementById('clear-btn').addEventListener('click', clearAllRecords);

    // 添加初始化标的选择器
    initStockSelector();
});

// 添加新行函数
function addNewRow() {
    const table = document.querySelector('#trade-table tbody');
    const newRow = document.createElement('tr');
    const rowNumber = table.rows.length + 1;
    
    // 创建与第一行相同的单元格结构，并在最前面添加行号单元格
    newRow.innerHTML = `
        <td class="row-number">${rowNumber}</td>
        <td><input type="text"></td>
        <td><input type="date"></td>
        <td>
            <select class="operation-type">
                <option value="spot_buy">买入标的(含行权交割)</option>
                <option value="spot_sell">卖出标的(含行权交割)</option>
                <option value="option-buy-sell">期权结算</option>
            </select>
        </td>
        <td><input type="number" value="0" min="0" step="0.01"></td>
        <td><input type="number" value="0" min="0"></td>
        <td><input type="number" value="0" min="0" step="0.01"></td>
        <td><input type="number" value="0" min="0"></td>
        <td><input type="number" value="0" step="0.01"></td>
        <td><input type="number" value="0" step="0.01"></td>
        <td><input type="number" value="0" step="0.01"></td>
        <td><input type="text" placeholder="这笔交易如何？"></td>
    `;
    
    table.appendChild(newRow);
    
    // 为新添加的行号单元格添加点击事件
    newRow.querySelector('.row-number').addEventListener('click', function() {
        const row = this.closest('tr');
        const table = row.closest('tbody');
        row.remove();
        
        // 更新剩余行的行号
        Array.from(table.rows).forEach((tr, index) => {
            tr.cells[0].textContent = index + 1;
        });
    });
    
    // 滚动到新添加的行
    newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 保存记录函数
function saveRecord() {
    const table = document.querySelector('#trade-table tbody');
    const rows = table.querySelectorAll('tr');
    const records = [];
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const record = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: cells[1].querySelector('input').value,
            date: cells[2].querySelector('input').value,
            type: cells[3].querySelector('select').value,
            buyPrice: parseFloat(cells[4].querySelector('input').value) || 0,
            buyQuantity: parseInt(cells[5].querySelector('input').value) || 0,
            sellPrice: parseFloat(cells[6].querySelector('input').value) || 0,
            sellQuantity: parseInt(cells[7].querySelector('input').value) || 0,
            optionBuyProfit: parseFloat(cells[8].querySelector('input').value) || 0,
            optionSellProfit: parseFloat(cells[9].querySelector('input').value) || 0,
            fee: parseFloat(cells[10].querySelector('input').value) || 0,
            note: cells[11].querySelector('input').value
        };
        records.push(record);
    });

    try {
        // 获取现有数据
        const existingData = localStorage.getItem('tradeRecords');
        let data = existingData ? JSON.parse(existingData) : { records: [] };
        
        // 合并新记录
        data.records = [...data.records, ...records];
        data.lastId = records.length > 0 ? records[records.length - 1].id : (data.lastId || 0);
        
        // 保存到localStorage
        localStorage.setItem('tradeRecords', JSON.stringify(data));
        initStockSelector(); // 保存后更新选择器
        alert('记录保存成功!');
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败，请查看控制台');
    }
}

// 查询记录函数
function searchRecords(showFlag = true) {
    try {
        const searchName = document.getElementById('search-name').value.toLowerCase();
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const data = JSON.parse(localStorage.getItem('tradeRecords')) || { records: [] };
        const tbody = document.getElementById('amend-tbody');
        
        // 清空现有表格内容
        tbody.innerHTML = '';
        
        // 过滤记录
        const filteredRecords = data.records.filter(record => {
            const nameMatch = !searchName || record.name.toLowerCase().includes(searchName);
            let dateMatch = true;
            
            if (startDate && endDate) {
                dateMatch = record.date >= startDate && record.date <= endDate;
            } else if (startDate) {
                dateMatch = record.date >= startDate;
            } else if (endDate) {
                dateMatch = record.date <= endDate;
            }
            
            return nameMatch && dateMatch;
        });
        
        // 填充表格(改为可编辑形式)
        filteredRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="record-checkbox"></td>
                <td><input type="text" value="${record.name}"></td>
                <td><input type="date" value="${record.date}"></td>
                <td>
                    <select class="operation-type">
                        <option value="spot_buy" ${record.type === 'spot_buy' ? 'selected' : ''}>买入标的(含行权交割)</option>
                        <option value="spot_sell" ${record.type === 'spot_sell' ? 'selected' : ''}>卖出标的(含行权交割)</option>
                        <option value="option-buy-sell" ${record.type === 'option-buy-sell' ? 'selected' : ''}>期权结算</option>
                    </select>
                </td>
                <td><input type="number" value="${record.buyPrice.toFixed(2)}" min="0" step="0.01"></td>
                <td><input type="number" value="${record.buyQuantity}" min="0"></td>
                <td><input type="number" value="${record.sellPrice.toFixed(2)}" min="0" step="0.01"></td>
                <td><input type="number" value="${record.sellQuantity}" min="0"></td>
                <td><input type="number" value="${record.optionBuyProfit.toFixed(2)}" step="0.01"></td>
                <td><input type="number" value="${record.optionSellProfit.toFixed(2)}" step="0.01"></td>
                <td><input type="number" value="${record.fee.toFixed(2)}" step="0.01"></td>
                <td><input type="text" value="${record.note}" placeholder="这笔交易如何？"></td>
            `;
            row.setAttribute('data-id', record.id);
            tbody.appendChild(row);
        });
        
        const resultElement = document.getElementById('search-result');
        if (filteredRecords.length > 0) {
            resultElement.textContent = `找到 ${filteredRecords.length} 条匹配记录`;
        } else {
            resultElement.textContent = '未找到匹配记录';
        }
    } catch (error) {
        console.error('查询失败:', error);
        alert('查询失败，请查看控制台');
    }
}

// 保存修改函数
function saveAmend() {
    try {
        const tbody = document.getElementById('amend-tbody');
        const rows = tbody.querySelectorAll('tr');
        const checkedRecords = [];
        
        // 收集所有打勾的记录
        rows.forEach(row => {
            const checkbox = row.querySelector('.record-checkbox');
            if (checkbox && checkbox.checked) {
                const cells = row.querySelectorAll('td');
                const record = {
                    id: row.getAttribute('data-id'),
                    name: cells[1].querySelector('input').value,
                    date: cells[2].querySelector('input').value,
                    type: cells[3].querySelector('select').value,
                    buyPrice: parseFloat(cells[4].querySelector('input').value) || 0,
                    buyQuantity: parseInt(cells[5].querySelector('input').value) || 0,
                    sellPrice: parseFloat(cells[6].querySelector('input').value) || 0,
                    sellQuantity: parseInt(cells[7].querySelector('input').value) || 0,
                    optionBuyProfit: parseFloat(cells[8].querySelector('input').value) || 0,
                    optionSellProfit: parseFloat(cells[9].querySelector('input').value) || 0,
                    fee: parseFloat(cells[10].querySelector('input').value) || 0,
                    note: cells[11].querySelector('input').value
                };
                checkedRecords.push(record);
            }
        });

        if (checkedRecords.length === 0) {
            alert('请至少选择一条记录进行修改');
            return;
        }

        // 获取现有数据
        const existingData = localStorage.getItem('tradeRecords');
        let data = existingData ? JSON.parse(existingData) : { records: [] };
        
        // 更新已勾选的记录
        checkedRecords.forEach(updatedRecord => {
            console.log('正在更新记录ID:', updatedRecord.id, '类型:', typeof updatedRecord.id);
            const index = data.records.findIndex(r => {
                console.log('比较ID:', r.id, '类型:', typeof r.id, '与', updatedRecord.id);
                return r.id == updatedRecord.id; // 使用==而不是===允许类型转换
            });
            if (index !== -1) {
                console.log('找到匹配记录，位置:', index);
                data.records[index] = updatedRecord;
            } else {
                console.log('未找到匹配记录');
            }
        });
        
        // 保存到localStorage
        localStorage.setItem('tradeRecords', JSON.stringify(data));
        
        alert(`成功更新 ${checkedRecords.length} 条记录`);
    } catch (error) {
        console.error('保存修改失败:', error);
        alert('保存修改失败，请查看控制台');
    }
}

// 删除选中函数
function deleteSelected() {
    try {
        const tbody = document.getElementById('amend-tbody');
        const rows = tbody.querySelectorAll('tr');
        const checkedIds = [];
        
        // 收集所有打勾的记录ID
        rows.forEach(row => {
            const checkbox = row.querySelector('.record-checkbox');
            if (checkbox && checkbox.checked) {
                checkedIds.push(row.getAttribute('data-id'));
            }
        });

        if (checkedIds.length === 0) {
            alert('请至少选择一条记录进行删除');
            return;
        }

        // 获取现有数据
        const existingData = localStorage.getItem('tradeRecords');
        let data = existingData ? JSON.parse(existingData) : { records: [] };
        
        // 过滤掉已勾选的记录
        data.records = data.records.filter(record => !checkedIds.includes(record.id.toString()));
        
        // 保存到localStorage
        localStorage.setItem('tradeRecords', JSON.stringify(data));
        
        // 重新查询刷新表格
        const searchName = document.getElementById('search-name').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        searchRecords(searchName, startDate, endDate, false);
        
        alert(`成功删除 ${checkedIds.length} 条记录`);
    } catch (error) {
        console.error('删除记录失败:', error);
        alert('删除记录失败，请查看控制台');
    }
}

// 生成图表函数
function generateChart() {
    // ... 实现生成图表的逻辑 ...
}

// 切换清除按钮状态
function toggleClearButton() {
    const input = document.getElementById('confirm-input');
    const clearBtn = document.getElementById('clear-btn');
    clearBtn.disabled = input.value.toLowerCase() !== '确认';
}

// 清除所有记录
function clearAllRecords() {
    try {
        // 清除localStorage中的记录
        localStorage.removeItem('tradeRecords');
        
        // 重置查询结果表格
        const tbody = document.getElementById('amend-tbody');
        tbody.innerHTML = '';
        
        // 重置标的选择器
        const selector = document.getElementById('search-name');
        selector.innerHTML = '<option value="">-- 请选择 --</option>';
        
        // 重置搜索结果显示
        document.getElementById('search-result').textContent = '';
        
        // 重置确认输入框
        document.getElementById('confirm-input').value = '';
        document.getElementById('clear-btn').disabled = true;
        
        alert('所有记录已成功清除');
    } catch (error) {
        console.error('清除记录失败:', error);
        alert('清除记录失败，请查看控制台');
    }
}

// 初始化标的选择器
function initStockSelector() {
    const data = JSON.parse(localStorage.getItem('tradeRecords')) || { records: [] };
    const stockNames = [...new Set(data.records.map(record => record.name))];
    const selector = document.getElementById('search-name');
    
    // 清空现有选项（保留第一个"请选择"选项）
    selector.innerHTML = '<option value="">-- 请选择 --</option>';
    
    stockNames.forEach(name => {
        if (name) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            selector.appendChild(option);
        }
    });
}

// 在DOMContentLoaded事件监听器中添加
document.querySelectorAll('.row-number').forEach(cell => {
    cell.addEventListener('click', function() {
        const row = this.closest('tr');
        const table = row.closest('tbody');
        row.remove();
        
        // 更新剩余行的行号
        Array.from(table.rows).forEach((tr, index) => {
            tr.cells[0].textContent = index + 1;
            tr.cells[0].setAttribute('data-row', index + 1);
        });
    });
});