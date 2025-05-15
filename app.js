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

    // 在DOMContentLoaded事件监听器中添加
    document.getElementById('save-chart-image').addEventListener('click', saveChartImage);

    // 添加初始化标的选择器
    initStockSelector();
    // 初始化图表选择器
    initChartStockSelector();
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
        initChartStockSelector();
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
        }).sort((a, b) => {
            // 没有日期的记录排在最前面
            if (!a.date && !b.date) return 0;
            if (!a.date) return -1;
            if (!b.date) return 1;
            
            // 有日期的记录按从早到晚排序
            return new Date(a.date) - new Date(b.date);
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
            alert('请至少勾选一条记录进行修改');
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
            alert('请至少勾选一条记录进行删除');
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
    // 注册datalabels插件
    Chart.register(ChartDataLabels);
    
    const selectedStock = document.getElementById('stock-selector').value;
    if (!selectedStock) {
        alert('请选择要生成图表的标的');
        return;
    }

    const data = JSON.parse(localStorage.getItem('tradeRecords')) || { records: [] };
    const stockRecords = data.records.filter(record => record.name === selectedStock)
                                     .sort((a, b) => {
                                         // 没有日期的记录排在最前面
                                         if (!a.date && !b.date) return 0;
                                         if (!a.date) return -1;
                                         if (!b.date) return 1;
                                         
                                         // 有日期的记录按从早到晚排序
                                         return new Date(a.date) - new Date(b.date);
                                     });

    if (stockRecords.length === 0) {
        alert('没有找到该标的的交易记录');
        return;
    }

    // 如果spot_buy和spot_sell的记录没有日期，则把它们的日期赋成stockRecords里最早的一天日期
    const firstTradeDate = stockRecords.find(record => record.type ==='spot_buy' || record.type ==='spot_sell').date;
    stockRecords.forEach(record => {
        if (record.type ==='spot_buy' || record.type ==='spot_sell') {
            if (!record.date) {
                record.date = firstTradeDate;
            }
        }
    });

    // 找到第一次买入的索引
    const firstBuyIndex = stockRecords.findIndex(r => r.type === 'spot_buy');
    if (firstBuyIndex === -1) {
        alert('该标的没有买入记录，无法计算摊薄成本');
        return;
    }

    // 计算第一次买入前的期权损益总和
    const initialOptionProfit = stockRecords.slice(0, firstBuyIndex).reduce((sum, record) => {
        return sum + (record.optionBuyProfit || 0) + (record.optionSellProfit || 0) - (record.fee || 0);
    }, 0);

    // 只保留第一次买入及之后的记录
    const validRecords = stockRecords.slice(firstBuyIndex);
    
    // 计算累计成本和平均成本
    let totalCost = -initialOptionProfit; // 初始值为第一次买入前的期权损益总和
    let totalShares = 0;
    let lastAvgCost = 0;
    const chartData = [];
    
    validRecords.forEach(record => {
        if (record.type === 'spot_buy') {
            totalCost += record.buyPrice * record.buyQuantity;
            totalShares += record.buyQuantity;
            // 考虑期权损益
            totalCost -= (record.optionBuyProfit || 0) + (record.optionSellProfit || 0) - (record.fee || 0);
        } else if (record.type === 'spot_sell') {
            totalCost -= record.sellPrice * record.sellQuantity;
            totalShares -= record.sellQuantity;
             // 考虑期权损益
            totalCost -= (record.optionBuyProfit || 0) + (record.optionSellProfit || 0) - (record.fee || 0);
        } else if (record.type === 'option-buy-sell') {
            // 只处理期权结算
            totalCost -= (record.optionBuyProfit || 0) + (record.optionSellProfit || 0) - (record.fee || 0);
        }
        
        // 计算当前摊薄成本
        const currentAvgCost = totalShares > 0 ? (totalCost / totalShares) : lastAvgCost;
        lastAvgCost = currentAvgCost;
        
        chartData.push({
            date: record.date,
            avgCost: parseFloat(currentAvgCost.toFixed(2)),
            totalShares: totalShares
        });
    });

    // 使用Chart.js绘制图表
    const ctx = document.getElementById('cost-chart').getContext('2d');
    const chartSize = (document.getElementById('chart-size').value || 80) * 1500 / 100; // 将百分比转换为像素值(80%默认值)
    const container = document.querySelector('.chart-container');
    container.style.width = `${chartSize}px`;
    container.style.height = `${chartSize * 0.5625}px`; // 保持16:9宽高比
    
    // 销毁现有图表实例（如果存在）
    if (window.myChart) {
        window.myChart.destroy();
    }
    
    // 创建新图表实例并保存引用
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(d => d.date),
            datasets: [
                {
                    label: '摊薄成本',
                    data: chartData.map(d => d.avgCost),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: '总持仓量',
                    data: chartData.map(d => d.totalShares),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                    yAxisID: 'y1',
                    hidden: !document.getElementById('show-shares-checkbox').checked
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    display: document.getElementById('show-value-checkbox').checked,
                    align: 'top',
                    anchor: 'center',
                    formatter: (value, context) => {
                        return context.datasetIndex === 0 ? value.toFixed(2) : value;
                    },
                    color: '#666',
                    font: {
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: '摊薄成本'
                    },
                    suggestedMax: Math.max(...chartData.map(d => d.avgCost)) * 1.05 // 增加5%高度
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: '总持仓量'
                    },
                    suggestedMax: Math.max(...chartData.map(d => d.totalShares)) * 1.05, // 增加5%高度
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
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

// 初始化标的选择器
function initChartStockSelector() {
    const data = JSON.parse(localStorage.getItem('tradeRecords')) || { records: [] };
    const stockNames = [...new Set(data.records.map(record => record.name))];
    const selector = document.getElementById('stock-selector');
    
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

// 导出数据功能
document.getElementById('export-btn').addEventListener('click', function() {
    try {
        const data = localStorage.getItem('tradeRecords');
        if (!data) {
            alert('没有可导出的数据');
            return;
        }
        
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trade_records_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('数据导出成功');
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请查看控制台');
    }
});

// 导入数据功能
document.getElementById('import-btn').addEventListener('click', function() {
    document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', function(e) {
    try {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const importedData = event.target.result;
            // 验证导入数据格式
            try {
                const parsedData = JSON.parse(importedData);
                if (!parsedData.records || !Array.isArray(parsedData.records)) {
                    throw new Error('无效的数据格式');
                }
                
                // 合并数据
                const existingData = localStorage.getItem('tradeRecords');
                let currentData = existingData ? JSON.parse(existingData) : { records: [] };
                currentData.records = [...currentData.records, ...parsedData.records];
                
                // 保存到localStorage
                localStorage.setItem('tradeRecords', JSON.stringify(currentData));
                initStockSelector(); // 更新选择器
                initChartStockSelector();
                alert(`成功导入 ${parsedData.records.length} 条记录`);
            } catch (error) {
                console.error('导入失败:', error);
                alert('导入失败: 文件格式不正确');
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败，请查看控制台');
    } finally {
        // 重置文件输入，允许重复选择同一文件
        e.target.value = '';
    }
});

// 添加保存图片函数
function saveChartImage() {
    if (!window.myChart) {
        alert('请先生成图表');
        return;
    }
    
    const link = document.createElement('a');
    link.download = '摊薄成本图表.png';
    link.href = document.getElementById('cost-chart').toDataURL('image/png');
    link.click();
}