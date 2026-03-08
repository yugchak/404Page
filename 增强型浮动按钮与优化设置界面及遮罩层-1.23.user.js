// ==UserScript==
// @name         增强型浮动按钮与优化设置界面及遮罩层
// @namespace    http://tampermonkey.net/
// @version      1.23
// @description  添加一个浮动按钮，通过点击页面上的任何元素来捕获并模拟点击，支持获取元素的选择器或链接的href，并在选择后隐藏该元素。在设置打开时禁用页面交互。支持设置浮动按钮在左边、右边或居中。
// @author       YourName
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let settingsDiv = null;
    let overlay = null;

    // Function to create and display the floating button
    function createFloatingButton() {
        const floatingButton = document.createElement('button');
        floatingButton.id = 'tm-floating-button';
        floatingButton.textContent = '模拟点击';
        floatingButton.style.position = 'fixed';
        floatingButton.style.bottom = '20px'; // 固定底部位置
        floatingButton.style.padding = '10px 20px';
        floatingButton.style.background = '#4CAF50';
        floatingButton.style.color = 'white';
        floatingButton.style.border = 'none';
        floatingButton.style.borderRadius = '5px';
        floatingButton.style.cursor = 'pointer';
        floatingButton.style.zIndex = '9998';
        floatingButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        floatingButton.style.transition = 'left 0.3s ease, right 0.3s ease'; // 添加过渡效果
        floatingButton.style.width = '100px'; // 固定宽度，避免拉伸
        floatingButton.style.fontSize = '14px'; // 固定字体大小为14px

        // 根据存储的设置调整按钮位置
        const buttonSide = localStorage.getItem('floatingButtonSide') || 'right';
        if (buttonSide === 'left') {
            floatingButton.style.left = '-50px'; // 初始隐藏在左侧
            floatingButton.style.right = 'auto';
        } else if (buttonSide === 'center') {
            floatingButton.style.left = '50%';
            floatingButton.style.right = 'auto';
            floatingButton.style.transform = 'translateX(-50%)';
        } else {
            floatingButton.style.right = '-50px'; // 初始隐藏在右侧
            floatingButton.style.left = 'auto';
        }

        // Add hover effect to show the button fully
        floatingButton.addEventListener('mouseenter', () => {
            if (buttonSide === 'left') {
                floatingButton.style.left = '20px';
            } else if (buttonSide === 'center') {
                floatingButton.style.left = '50%';
                floatingButton.style.transform = 'translateX(-50%)';
            } else {
                floatingButton.style.right = '20px';
            }
        });

        floatingButton.addEventListener('mouseleave', () => {
            if (buttonSide === 'left') {
                floatingButton.style.left = '-50px';
            } else if (buttonSide === 'center') {
                floatingButton.style.left = '50%';
                floatingButton.style.transform = 'translateX(-50%)';
            } else {
                floatingButton.style.right = '-50px';
            }
        });

        // Function to hide the settings box
        function hideSettingsBox() {
            if (settingsDiv && settingsDiv.style.display === 'block') {
                settingsDiv.style.display = 'none';
                overlay.style.display = 'none';
            }
        }

        // Add click event listener to the floating button
        floatingButton.addEventListener('click', () => {
            if (settingsDiv && settingsDiv.style.display === 'block') {
                hideSettingsBox(); // 如果设置框显示，则隐藏设置框并结束操作
                return; // 结束操作，不继续执行模拟点击
            }
            const selectedAction = localStorage.getItem('selectedAction');
            const selectedElementSelector = localStorage.getItem('selectedElementSelector');
            switch (selectedAction) {
                case 'click':
                    simulateClick(selectedElementSelector);
                    break;
                case 'open':
                    openURL();
                    break;
                default:
                    alert('未选择操作。请在设置中选择一个操作。');
            }
        });

        // Add contextmenu event listener to the floating button
        floatingButton.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            if (settingsDiv == null || settingsDiv.style.display === 'none') {
                showSettings(); // 如果设置框隐藏，则显示设置框
            } else {
                hideSettingsBox(); // 如果设置框显示，则隐藏设置框
            }
        });

        document.body.appendChild(floatingButton);
    }

    // Function to display the settings interface
    function showSettings() {
        if (!settingsDiv) {
            settingsDiv = document.createElement('div');
            settingsDiv.id = 'tm-settings';
            settingsDiv.style.position = 'fixed';
            settingsDiv.style.top = '50%';
            settingsDiv.style.left = '50%';
            settingsDiv.style.transform = 'translate(-50%, -50%)';
            settingsDiv.style.padding = '20px';
            settingsDiv.style.background = '#fff';
            settingsDiv.style.border = '1px solid #ccc';
            settingsDiv.style.borderRadius = '10px';
            settingsDiv.style.zIndex = '9999';
            settingsDiv.style.display = 'none';
            settingsDiv.style.width = '300px';
            settingsDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            settingsDiv.style.fontFamily = 'Arial, sans-serif';

            const settingsTitle = document.createElement('h3');
            settingsTitle.textContent = '设置';
            settingsTitle.style.textAlign = 'center';
            settingsTitle.style.marginBottom = '20px';
            settingsTitle.style.color = '#333';

            const actionLabel = document.createElement('label');
            actionLabel.textContent = '选择操作：';
            actionLabel.style.display = 'block';
            actionLabel.style.marginBottom = '10px';
            actionLabel.style.color = '#555';

            const actionSelect = document.createElement('select');
            actionSelect.id = 'action-select';
            actionSelect.style.width = '100%';
            actionSelect.style.padding = '8px';
            actionSelect.style.marginBottom = '20px';
            actionSelect.style.border = '1px solid #ddd';
            actionSelect.style.borderRadius = '4px';
            const actions = [
                { value: 'click', text: '模拟点击' },
                { value: 'open', text: '打开链接' }
            ];
            actions.forEach(action => {
                const option = document.createElement('option');
                option.value = action.value;
                option.textContent = action.text;
                actionSelect.appendChild(option);
            });

            const elementLabel = document.createElement('label');
            elementLabel.textContent = '元素选择器：';
            elementLabel.style.display = 'block';
            elementLabel.style.marginTop = '20px';
            elementLabel.style.marginBottom = '10px';
            elementLabel.style.color = '#555';

            const elementSelectorInput = document.createElement('input');
            elementSelectorInput.id = 'element-selector';
            elementSelectorInput.type = 'text';
            elementSelectorInput.style.width = '100%'; // 确保宽度与其他组件一致
            elementSelectorInput.style.padding = '8px';
            elementSelectorInput.style.marginBottom = '20px';
            elementSelectorInput.style.border = '1px solid #ddd';
            elementSelectorInput.style.borderRadius = '4px';
            elementSelectorInput.style.boxSizing = 'border-box'; // 确保宽度包括内边距和边框

            const positionLabel = document.createElement('label');
            positionLabel.textContent = '浮动按钮位置：';
            positionLabel.style.display = 'block';
            positionLabel.style.marginTop = '20px';
            positionLabel.style.marginBottom = '10px';
            positionLabel.style.color = '#555';

            const positionSelect = document.createElement('select');
            positionSelect.id = 'position-select';
            positionSelect.style.width = '100%';
            positionSelect.style.padding = '8px';
            positionSelect.style.marginBottom = '20px';
            positionSelect.style.border = '1px solid #ddd';
            positionSelect.style.borderRadius = '4px';
            const positions = [
                { value: 'right', text: '右边' },
                { value: 'left', text: '左边' },
                { value: 'center', text: '居中' }
            ];
            positions.forEach(pos => {
                const option = document.createElement('option');
                option.value = pos.value;
                option.textContent = pos.text;
                positionSelect.appendChild(option);
            });
            positionSelect.value = localStorage.getItem('floatingButtonSide') || 'right';

            const captureButton = document.createElement('button');
            captureButton.textContent = '捕获元素';
            captureButton.style.display = 'block';
            captureButton.style.width = '100%';
            captureButton.style.padding = '10px';
            captureButton.style.marginBottom = '10px';
            captureButton.style.background = '#5cb85c';
            captureButton.style.color = 'white';
            captureButton.style.border = 'none';
            captureButton.style.borderRadius = '4px';
            captureButton.style.cursor = 'pointer';
            captureButton.addEventListener('click', () => {
                overlay.style.display = 'none'; // 隐藏遮罩层
                settingsDiv.style.display = 'none'; // 隐藏设置框
                const originalOnClick = document.onclick;
                document.onclick = function(event) {
                    const target = event.target;
                    if (settingsDiv.contains(target)) {
                        return;
                    }
                    event.preventDefault(); // 阻止点击事件的默认行为
                    const capturedValue = getSelector(target); // 捕获元素的选择器
                    elementSelectorInput.value = capturedValue;
                    document.onclick = originalOnClick; // 恢复原始点击事件
                    overlay.style.display = 'block'; // 显示遮罩层
                    settingsDiv.style.display = 'block'; // 显示设置框
                };
            });

            const captureHrefButton = document.createElement('button');
            captureHrefButton.textContent = '捕获链接的href';
            captureHrefButton.style.display = 'block';
            captureHrefButton.style.width = '100%';
            captureHrefButton.style.padding = '10px';
            captureHrefButton.style.marginBottom = '10px';
            captureHrefButton.style.background = '#f0ad4e';
            captureHrefButton.style.color = 'white';
            captureHrefButton.style.border = 'none';
            captureHrefButton.style.borderRadius = '4px';
            captureHrefButton.style.cursor = 'pointer';
            captureHrefButton.addEventListener('click', () => {
                overlay.style.display = 'none'; // 隐藏遮罩层
                settingsDiv.style.display = 'none'; // 隐藏设置框
                const originalOnClick = document.onclick;
                document.onclick = function(event) {
                    const target = event.target;
                    if (settingsDiv.contains(target)) {
                        return;
                    }
                    event.preventDefault(); // 阻止点击事件的默认行为
                    if (target.tagName.toLowerCase() === 'a') {
                        const capturedValue = target.href; // 捕获 <a> 标签的 href 属性
                        elementSelectorInput.value = capturedValue;
                        localStorage.setItem('selectedElementSelector', capturedValue); // 保存 href 到 localStorage
                    } else {
                        alert('仅支持捕获 <a> 标签的 href。');
                    }
                    document.onclick = originalOnClick; // 恢复原始点击事件
                    overlay.style.display = 'block'; // 显示遮罩层
                    settingsDiv.style.display = 'block'; // 显示设置框
                };
            });

            const hideElementButton = document.createElement('button');
            hideElementButton.textContent = '选择并隐藏元素';
            hideElementButton.style.display = 'block';
            hideElementButton.style.width = '100%';
            hideElementButton.style.padding = '10px';
            hideElementButton.style.marginBottom = '10px';
            hideElementButton.style.background = '#5bc0de'; // 修改为与修改页面内容按钮相同的颜色
            hideElementButton.style.color = 'white';
            hideElementButton.style.border = 'none';
            hideElementButton.style.borderRadius = '4px';
            hideElementButton.style.cursor = 'pointer';
            hideElementButton.addEventListener('click', () => {
                overlay.style.display = 'none'; // 隐藏遮罩层
                settingsDiv.style.display = 'none'; // 隐藏设置框
                const originalOnClick = document.onclick;
                document.onclick = function(event) {
                    const target = event.target;
                    if (settingsDiv.contains(target)) {
                        return;
                    }
                    event.preventDefault(); // 阻止点击事件的默认行为
                    target.style.display = 'none'; // 隐藏选中的元素
                    document.onclick = originalOnClick; // 恢复原始点击事件
                    overlay.style.display = 'block'; // 显示遮罩层
                    settingsDiv.style.display = 'block'; // 显示设置框
                };
            });

            const modifyContentButton = document.createElement('button');
            modifyContentButton.textContent = '修改页面内容';
            modifyContentButton.style.display = 'block';
            modifyContentButton.style.width = '100%';
            modifyContentButton.style.padding = '10px';
            modifyContentButton.style.marginBottom = '20px'; // 增加间隔
            modifyContentButton.style.background = '#5bc0de';
            modifyContentButton.style.color = 'white';
            modifyContentButton.style.border = 'none';
            modifyContentButton.style.borderRadius = '4px';
            modifyContentButton.style.cursor = 'pointer';
            modifyContentButton.addEventListener('click', () => {
                const newContent = prompt('请输入要修改的内容：');
                if (newContent !== null) {
                    const targetElement = document.querySelector(elementSelectorInput.value);
                    if (targetElement) {
                        targetElement.textContent = newContent;
                    } else {
                        alert('未找到指定的元素！');
                    }
                }
            });

            const saveButton = document.createElement('button');
            saveButton.textContent = '保存';
            saveButton.style.display = 'block';
            saveButton.style.width = '100%';
            saveButton.style.padding = '10px';
            saveButton.style.marginTop = '30px'; // 增加上方间隔
            saveButton.style.marginBottom = '10px'; // 减少下方间隔
            saveButton.style.background = '#337ab7';
            saveButton.style.color = 'white';
            saveButton.style.border = 'none';
            saveButton.style.borderRadius = '4px';
            saveButton.style.cursor = 'pointer';
            saveButton.addEventListener('click', () => {
                const selectedAction = actionSelect.value;
                const selectedElementSelector = elementSelectorInput.value;
                const floatingButtonSide = positionSelect.value;
                const currentButtonSide = localStorage.getItem('floatingButtonSide') || 'right';

                localStorage.setItem('selectedAction', selectedAction);
                localStorage.setItem('selectedElementSelector', selectedElementSelector);
                localStorage.setItem('floatingButtonSide', floatingButtonSide);

                settingsDiv.style.display = 'none';
                overlay.style.display = 'none';

                // 如果按钮方向发生变化，则强制刷新页面
                if (currentButtonSide !== floatingButtonSide) {
                    location.reload();
                }
            });

            const clearLocalStorageButton = document.createElement('button');
            clearLocalStorageButton.textContent = '清除设置';
            clearLocalStorageButton.style.display = 'block';
            clearLocalStorageButton.style.width = '100%';
            clearLocalStorageButton.style.padding = '10px';
            clearLocalStorageButton.style.marginBottom = '10px';
            clearLocalStorageButton.style.background = 'red'; // 修改为红色
            clearLocalStorageButton.style.color = 'white';
            clearLocalStorageButton.style.border = 'none';
            clearLocalStorageButton.style.borderRadius = '4px';
            clearLocalStorageButton.style.cursor = 'pointer';
            clearLocalStorageButton.addEventListener('click', () => {
                if (confirm('确定要清除所有设置吗？')) {
                    localStorage.removeItem('selectedAction');
                    localStorage.removeItem('selectedElementSelector');
                    localStorage.removeItem('floatingButtonSide');
                    alert('所有设置已清除。');
                }
            });

            const displayLocalStorageButton = document.createElement('button');
            displayLocalStorageButton.textContent = '显示设置';
            displayLocalStorageButton.style.display = 'block';
            displayLocalStorageButton.style.width = '100%';
            displayLocalStorageButton.style.padding = '10px';
            displayLocalStorageButton.style.marginBottom = '10px';
            displayLocalStorageButton.style.background = '#5bc0de';
            displayLocalStorageButton.style.color = 'white';
            displayLocalStorageButton.style.border = 'none';
            displayLocalStorageButton.style.borderRadius = '4px';
            displayLocalStorageButton.style.cursor = 'pointer';
            displayLocalStorageButton.addEventListener('click', () => {
                displayScriptSettings();
            });

            const closeButton = document.createElement('button');
            closeButton.textContent = '关闭';
            closeButton.style.display = 'block';
            closeButton.style.width = '100%';
            closeButton.style.padding = '10px';
            closeButton.style.background = '#d9534f';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '4px';
            closeButton.style.cursor = 'pointer';
            closeButton.addEventListener('click', () => {
                settingsDiv.style.display = 'none';
                overlay.style.display = 'none';
            });

            settingsDiv.appendChild(settingsTitle);
            settingsDiv.appendChild(actionLabel);
            settingsDiv.appendChild(actionSelect);
            settingsDiv.appendChild(elementLabel);
            settingsDiv.appendChild(elementSelectorInput);
            settingsDiv.appendChild(positionLabel);
            settingsDiv.appendChild(positionSelect);
            settingsDiv.appendChild(captureButton);
            settingsDiv.appendChild(captureHrefButton);
            settingsDiv.appendChild(hideElementButton);
            settingsDiv.appendChild(modifyContentButton);
            settingsDiv.appendChild(saveButton);
            settingsDiv.appendChild(displayLocalStorageButton);
            settingsDiv.appendChild(clearLocalStorageButton);
            settingsDiv.appendChild(closeButton);

            document.body.appendChild(settingsDiv);
        }

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'tm-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.zIndex = '9997';
            overlay.style.display = 'none';

            document.body.appendChild(overlay);
        }

        settingsDiv.style.display = 'block';
        overlay.style.display = 'block';
    }

    // Function to simulate a click on an element
    function simulateClick(selector) {
        const targetElement = document.querySelector(selector);
        if (targetElement) {
            targetElement.click();
        } else {
            alert('未找到指定的元素！');
        }
    }

    // Function to modify page content
    function modifyContent() {
        const newContent = prompt('请输入要修改的内容：');
        if (newContent !== null) {
            const targetElement = document.querySelector(elementSelectorInput.value);
            if (targetElement) {
                targetElement.textContent = newContent;
            } else {
                alert('未找到指定的元素！');
            }
        }
    }

    // Function to open a URL
    function openURL() {
        const url = localStorage.getItem('selectedElementSelector'); // 从 localStorage 中获取保存的 href
        if (url) {
            window.open(url, '_blank'); // 在新标签页中打开链接
        } else {
            alert('未捕获到有效的链接地址。');
        }
    }

    // Function to get a unique selector for an element
    function getSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        } else if (element.className) {
            return `.${element.className.split(' ')[0]}`;
        } else {
            return `${element.tagName.toLowerCase()}:nth-of-type(${Array.prototype.indexOf.call(element.parentNode.children, element) + 1})`;
        }
    }

    // Function to display script-specific LocalStorage content
    function displayScriptSettings() {
        const scriptSettings = {
            selectedAction: localStorage.getItem('selectedAction'),
            selectedElementSelector: localStorage.getItem('selectedElementSelector'),
            floatingButtonSide: localStorage.getItem('floatingButtonSide')
        };
        const settingsContent = Object.entries(scriptSettings)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        alert(`脚本设置：\n${settingsContent}`);
    }

    // Create the floating button when the script is loaded
    createFloatingButton();
})();