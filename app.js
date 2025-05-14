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
});

// 添加新行函数
function addNewRow() {
    // ... 实现添加新行的逻辑 ...
}

// 保存记录函数
function saveRecord() {
    // ... 实现保存记录的逻辑 ...
}

// 查询记录函数
function searchRecords() {
    // ... 实现查询记录的逻辑 ...
}

// 保存修改函数
function saveAmend() {
    // ... 实现保存修改的逻辑 ...
}

// 删除选中函数
function deleteSelected() {
    // ... 实现删除选中记录的逻辑 ...
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
    // ... 实现清除所有记录的逻辑 ...
}