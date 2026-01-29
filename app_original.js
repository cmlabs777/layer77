
        // Sample Data
        const vocData = [];
        let currentTicketNumber = 156;
        let filteredData = [];
        let currentPage = 1;
        let rowsPerPage = 50;
        let sortColumn = null;
        let sortDirection = 'asc';
        let currentVocId = null;

        // Status mapping
        const statusMapping = {
            'received': { text: '접수', class: 'received' },
            'reviewing': { text: '검토중', class: 'reviewing' },
            'pending-assignment': { text: '할당대기', class: 'pending-assignment' },
            'in-progress': { text: '처리중', class: 'in-progress' },
            'monitoring': { text: '모니터링', class: 'monitoring' },
            'closed': { text: '종료', class: 'closed' }
        };

        // Generate sample VoC data
        function generateSampleData() {
            const channels = ['무신사', '29cm', '기타1', '기타2', '기타3'];
            const categories = [
                { name: '상품품질', class: 'product' },
                { name: '배송', class: 'delivery' },
                { name: '고객서비스', class: 'service' },
                { name: '웹사이트/앱', class: 'website' }
            ];
            const sentiments = [
                { text: '긍정', emoji: '😊', class: 'positive' },
                { text: '중립', emoji: '😐', class: 'neutral' },
                { text: '부정', emoji: '😞', class: 'negative' }
            ];
            const impacts = ['High', 'Medium', 'Low'];
            const statusKeys = Object.keys(statusMapping);

            const vocContents = [
                '배송이 너무 늦어요. 주문한지 일주일이 넘었는데 아직도 배송 준비중이라고 나와요.',
                '상품 사이즈가 설명과 달라요. 반품 처리 부탁드립니다.',
                '고객센터 전화가 항상 통화중이에요. 문의 응대가 너무 느립니다.',
                '환불 처리가 안되고 있습니다. 확인 부탁드립니다.',
                '제품 품질이 생각보다 좋네요. 만족합니다.',
                '웹사이트에서 결제가 안되는 오류가 있어요.',
                '포장 상태가 불량해서 제품이 파손되어 도착했습니다.',
                '상품 설명과 실제 색상이 많이 다릅니다.',
                '교환 신청했는데 처리가 안되고 있어요.',
                '앱이 자주 멈추고 느려요. 개선이 필요합니다.',
                '사이즈 안내가 정확해서 좋았어요.',
                '배송 기사님이 친절하셨습니다.',
                '재고가 없다고 하더니 다시 판매중이네요. 뭔가요?',
                '할인 쿠폰이 적용이 안됩니다.',
                '반품 절차가 너무 복잡해요.'
            ];

            // Generate 2847 VoC entries
            for (let i = 1; i <= 100; i++) {
                const isTicketed = i <= 156;
                const channel = channels[Math.floor(Math.random() * channels.length)];
                const category = categories[Math.floor(Math.random() * categories.length)];
                const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
                const impact = impacts[Math.floor(Math.random() * impacts.length)];
                
                let statusKey;
                if (isTicketed) {
                    statusKey = statusKeys[Math.floor(Math.random() * statusKeys.length)];
                } else {
                    statusKey = 'received';
                }

                const date = new Date(2026, 0, Math.floor(Math.random() * 26) + 1);
                date.setHours(Math.floor(Math.random() * 24));
                date.setMinutes(Math.floor(Math.random() * 60));

                vocData.push({
                    id: i,
                    ticketNumber: isTicketed ? `TKT-${String(currentTicketNumber - (156 - i)).padStart(4, '0')}` : null,
                    ticketName: isTicketed ? `${category.name} 이슈 #${i}` : '',
                    date: date,
                    channel: channel,
                    customerId: `cust***@email.com`,
                    content: vocContents[Math.floor(Math.random() * vocContents.length)],
                    category: category,
                    sentiment: sentiment,
                    impact: impact,
                    statusKey: statusKey,
                    status: statusMapping[statusKey],
                    selected: false
                });
            }

            // Sort by ID descending (newest first)
            vocData.sort((a, b) => b.id - a.id);
            filteredData = [...vocData];
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            generateSampleData();
            initializeNavigation();
            initializeCollection();
            initializeDatabase();
            renderTable();
            generateRecentActivity();
            initializeModal();
        });

        // Navigation
        function initializeNavigation() {
            const navTabs = document.querySelectorAll('.nav-tab');
            const pages = document.querySelectorAll('.page');

            navTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const pageName = tab.dataset.page;
                    
                    navTabs.forEach(t => t.classList.remove('active'));
                    pages.forEach(p => p.classList.remove('active'));
                    
                    tab.classList.add('active');
                    document.getElementById(`${pageName}-page`).classList.add('active');
                    document.getElementById('current-page').textContent = tab.textContent;

                    // Render kanban board when dashboard tab is clicked
                    if (pageName === 'dashboard') {
                        renderKanbanBoard();
                    }
                });
            });
        }

        // Collection Page
        function initializeCollection() {
            // Upload Zone
            const uploadZone = document.getElementById('upload-zone');
            const fileInput = document.getElementById('file-input');

            uploadZone.addEventListener('click', () => fileInput.click());
            
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('dragover');
            });

            uploadZone.addEventListener('dragleave', () => {
                uploadZone.classList.remove('dragover');
            });

            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('dragover');
                handleFiles(e.dataTransfer.files);
            });

            fileInput.addEventListener('change', (e) => {
                handleFiles(e.target.files);
            });

            // Download Template
            document.getElementById('download-template').addEventListener('click', () => {
                showToast('템플릿 다운로드가 시작되었습니다', 'success');
            });
        }

        function handleFiles(files) {
            const historyList = document.querySelector('.upload-history-list');
            
            Array.from(files).forEach(file => {
                const fileSize = (file.size / 1024 / 1024).toFixed(1);
                const uploadItem = document.createElement('div');
                uploadItem.className = 'upload-item';
                
                const progress = Math.floor(Math.random() * 30) + 70;
                
                uploadItem.innerHTML = `
                    <div class="upload-item-header">
                        <span class="upload-item-filename">${file.name}</span>
                        <button class="delete-btn" onclick="this.parentElement.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="upload-item-meta">
                        ${fileSize}MB • 업로드 중 • ${progress}/100 rows
                    </div>
                    <div class="upload-progress-bar">
                        <div class="upload-progress-fill" style="width: ${progress}%"></div>
                    </div>
                `;
                
                historyList.insertBefore(uploadItem, historyList.firstChild);
            });

            showToast(`${files.length}개 파일 업로드가 시작되었습니다`, 'success');
        }

        // Generate Recent Activity
        function generateRecentActivity() {
            const activityContainer = document.getElementById('recent-activity');
            const activities = [
                { type: 'crawling', title: '무신사 리뷰 자동 수집', count: 142, time: '5분 전' },
                { type: 'upload', title: 'customer_feedback_jan.xlsx 업로드', count: 85, time: '1시간 전' },
                { type: 'crawling', title: '29cm 상품평 수집', count: 67, time: '2시간 전' },
                { type: 'crawling', title: '기타1 댓글 수집', count: 34, time: '3시간 전' }
            ];

            activityContainer.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon ${activity.type}">
                        <i class="fas fa-${activity.type === 'crawling' ? 'robot' : 'cloud-upload-alt'}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-meta">${activity.time} • 담당자: 김민지</div>
                    </div>
                    <div class="activity-count">${activity.count}</div>
                </div>
            `).join('');
        }

        // Database Page
        function initializeDatabase() {
            // Select All
            document.getElementById('select-all').addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('#voc-table-body input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    if (!cb.disabled) {
                        cb.checked = e.target.checked;
                        const row = cb.closest('tr');
                        if (e.target.checked) {
                            row.classList.add('selected');
                        } else {
                            row.classList.remove('selected');
                        }
                    }
                });
                updateSelection();
            });

            // Create Tickets Button
            document.getElementById('create-tickets-btn').addEventListener('click', createTickets);

            // Search
            document.getElementById('search-input').addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                filteredData = vocData.filter(item => 
                    item.content.toLowerCase().includes(searchTerm) ||
                    item.channel.toLowerCase().includes(searchTerm) ||
                    item.category.name.toLowerCase().includes(searchTerm)
                );
                currentPage = 1;
                renderTable();
            });

            // Refresh
            document.getElementById('refresh-btn').addEventListener('click', () => {
                showToast('데이터를 새로고침했습니다', 'success');
                renderTable();
            });

            // Sorting
            document.querySelectorAll('.sortable').forEach(header => {
                header.addEventListener('click', () => {
                    const column = header.dataset.sort;
                    if (sortColumn === column) {
                        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        sortColumn = column;
                        sortDirection = 'asc';
                    }
                    sortData();
                    renderTable();
                });
            });

            // Pagination
            document.getElementById('prev-page').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderTable();
                }
            });

            document.getElementById('next-page').addEventListener('click', () => {
                const totalPages = Math.ceil(filteredData.length / rowsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable();
                }
            });

            document.getElementById('rows-per-page').addEventListener('change', (e) => {
                rowsPerPage = parseInt(e.target.value);
                currentPage = 1;
                renderTable();
            });
        }

        // Modal functions
        function initializeModal() {
            // Status selector
            document.querySelectorAll('.status-option').forEach(option => {
                option.addEventListener('click', function() {
                    document.querySelectorAll('.status-option').forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }

        function openVocModal(vocId) {
            const voc = vocData.find(v => v.id === vocId);
            if (!voc) return;

            currentVocId = vocId;

            // Populate modal data
            document.getElementById('modal-ticket-number').textContent = voc.ticketNumber || '-';
            document.getElementById('modal-date').textContent = formatDate(voc.date);
            document.getElementById('modal-channel').textContent = voc.channel;
            document.getElementById('modal-customer-id').textContent = voc.customerId;
            document.getElementById('modal-category').textContent = voc.category.name;
            document.getElementById('modal-sentiment').textContent = `${voc.sentiment.emoji} ${voc.sentiment.text}`;
            document.getElementById('modal-impact').textContent = voc.impact;
            document.getElementById('modal-content').textContent = voc.content;
            document.getElementById('modal-ticket-name').value = voc.ticketName || '';

            // Set active status
            document.querySelectorAll('.status-option').forEach(opt => opt.classList.remove('active'));
            const statusOption = document.querySelector(`[data-status="${voc.statusKey}"]`);
            if (statusOption) {
                statusOption.classList.add('active');
            }

            document.getElementById('voc-detail-modal').classList.add('active');
        }

        function closeVocModal() {
            document.getElementById('voc-detail-modal').classList.remove('active');
            currentVocId = null;
        }

        function saveVocDetails() {
            if (!currentVocId) return;

            const voc = vocData.find(v => v.id === currentVocId);
            if (!voc) return;

            // Get selected status
            const selectedStatus = document.querySelector('.status-option.active');
            if (selectedStatus) {
                const statusKey = selectedStatus.dataset.status;
                voc.statusKey = statusKey;
                voc.status = statusMapping[statusKey];
            }

            // Get ticket name
            voc.ticketName = document.getElementById('modal-ticket-name').value;

            showToast('VoC 정보가 저장되었습니다', 'success');
            closeVocModal();
            renderTable();
            renderKanbanBoard();
        }

        function sortData() {
            filteredData.sort((a, b) => {
                let aVal, bVal;
                
                switch (sortColumn) {
                    case 'date':
                        aVal = a.date.getTime();
                        bVal = b.date.getTime();
                        break;
                    case 'ticketNumber':
                        aVal = a.ticketNumber || '';
                        bVal = b.ticketNumber || '';
                        break;
                    case 'impact':
                        const impactOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                        aVal = impactOrder[a.impact];
                        bVal = impactOrder[b.impact];
                        break;
                    default:
                        return 0;
                }

                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }

        function renderTable() {
            const tbody = document.getElementById('voc-table-body');
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const pageData = filteredData.slice(start, end);

            tbody.innerHTML = pageData.map((item, index) => {
                const rowNum = start + index + 1;
                const channelClass = item.channel.toLowerCase().replace(/[^a-z0-9]/g, '');
                
                return `
                    <tr class="${item.selected ? 'selected' : ''}" onclick="handleRowClick(event, ${item.id})">
                        <td class="checkbox-col" onclick="event.stopPropagation()">
                            <input type="checkbox" 
                                   ${item.selected ? 'checked' : ''} 
                                   ${item.ticketNumber ? 'disabled' : ''}
                                   onchange="toggleSelection(${item.id})">
                        </td>
                        <td>${rowNum}</td>
                        <td>
                            ${item.ticketNumber ? 
                                `<span class="ticket-number">${item.ticketNumber}</span>` : 
                                '<span style="color: var(--gray-400);">-</span>'
                            }
                        </td>
                        <td>${formatDate(item.date)}</td>
                        <td>
                            <span class="channel-badge ${channelClass}">
                                ${item.channel}
                            </span>
                        </td>
                        <td class="customer-id">${item.customerId}</td>
                        <td class="voc-content">${item.content}</td>
                        <td>
                            <div class="category-tags">
                                <span class="category-tag ${item.category.class}">${item.category.name}</span>
                            </div>
                        </td>
                        <td>
                            <span class="sentiment ${item.sentiment.class}">
                                ${item.sentiment.emoji} ${item.sentiment.text}
                            </span>
                        </td>
                        <td>
                            <span class="impact-badge ${item.impact.toLowerCase()}">${item.impact}</span>
                        </td>
                        <td>
                            <span class="status-badge ${item.status.class}">${item.status.text}</span>
                        </td>
                        <td onclick="event.stopPropagation()">
                            <button class="action-menu-btn">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Update pagination info
            document.getElementById('page-start').textContent = start + 1;
            document.getElementById('page-end').textContent = Math.min(end, filteredData.length);
            document.getElementById('total-items').textContent = filteredData.length;
            document.getElementById('total-count').textContent = vocData.length.toLocaleString();

            // Update page numbers
            renderPageNumbers();

            // Update prev/next buttons
            document.getElementById('prev-page').disabled = currentPage === 1;
            document.getElementById('next-page').disabled = currentPage === Math.ceil(filteredData.length / rowsPerPage);
        }

        function handleRowClick(event, vocId) {
            // Don't open modal if clicking checkbox or action button
            if (event.target.closest('.checkbox-col') || event.target.closest('.action-menu-btn')) {
                return;
            }
            openVocModal(vocId);
        }

        function renderPageNumbers() {
            const pageNumbers = document.getElementById('page-numbers');
            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
            const maxVisible = 5;
            
            let html = '';
            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
            
            if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                html += `
                    <div class="page-number ${i === currentPage ? 'active' : ''}" 
                         onclick="goToPage(${i})">
                        ${i}
                    </div>
                `;
            }

            if (endPage < totalPages) {
                html += '<span style="padding: 0 8px; color: var(--gray-400);">...</span>';
                html += `
                    <div class="page-number" onclick="goToPage(${totalPages})">
                        ${totalPages}
                    </div>
                `;
            }

            pageNumbers.innerHTML = html;
        }

        function goToPage(page) {
            currentPage = page;
            renderTable();
        }

        function toggleSelection(id) {
            const item = vocData.find(v => v.id === id);
            if (item && !item.ticketNumber) {
                item.selected = !item.selected;
                updateSelection();
            }
        }

        function updateSelection() {
            const selectedCount = vocData.filter(v => v.selected).length;
            const createBtn = document.getElementById('create-tickets-btn');
            createBtn.disabled = selectedCount === 0;
            
            if (selectedCount > 0) {
                createBtn.textContent = `선택 항목 티켓 생성 (${selectedCount})`;
            } else {
                createBtn.textContent = '선택 항목 티켓 생성';
            }
        }

        function createTickets() {
            const selectedItems = vocData.filter(v => v.selected);
            
            if (selectedItems.length === 0) {
                showToast('티켓으로 전환할 VoC를 선택해주세요', 'error');
                return;
            }

            // Simulate ticket creation
            selectedItems.forEach(item => {
                currentTicketNumber++;
                item.ticketNumber = `TKT-${String(currentTicketNumber).padStart(4, '0')}`;
                item.ticketName = `${item.category.name} 이슈 #${item.id}`;
                item.statusKey = 'received';
                item.status = statusMapping['received'];
                item.selected = false;
            });

            // Update ticket count
            const ticketCount = vocData.filter(v => v.ticketNumber).length;
            document.getElementById('ticket-count').textContent = ticketCount;

            showToast(`${selectedItems.length}개의 VoC가 티켓으로 전환되었습니다`, 'success');
            
            renderTable();
            updateSelection();
        }

        function renderKanbanBoard() {
            const kanbanBoard = document.getElementById('kanban-board');
            const statusKeys = Object.keys(statusMapping);
            
            // Filter ticketed items by status
            const ticketedItems = vocData.filter(v => v.ticketNumber);
            
            kanbanBoard.innerHTML = statusKeys.map(statusKey => {
                const status = statusMapping[statusKey];
                const items = ticketedItems.filter(v => v.statusKey === statusKey);
                
                return `
                    <div class="kanban-column">
                        <div class="kanban-header">
                            <div class="kanban-title">${status.text}</div>
                            <div class="kanban-count">${items.length}</div>
                        </div>
                        <div class="kanban-cards">
                            ${items.map(item => `
                                <div class="kanban-card" onclick="openVocModal(${item.id})">
                                    <div class="kanban-card-header">
                                        <div class="kanban-ticket">${item.ticketNumber}</div>
                                        <div class="kanban-priority impact-badge ${item.impact.toLowerCase()}">${item.impact}</div>
                                    </div>
                                    <div class="kanban-card-title">${item.ticketName || item.content}</div>
                                    <div class="kanban-card-meta">
                                        <span>${item.channel}</span>
                                        <span>${item.category.name}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }

        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}.${month}.${day} ${hours}:${minutes}`;
        }

        // Toast Notification
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = `toast ${type} show`;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Export for inline event handlers
        window.toggleSelection = toggleSelection;
        window.goToPage = goToPage;
        window.openVocModal = openVocModal;
        window.closeVocModal = closeVocModal;
        window.saveVocDetails = saveVocDetails;
        window.handleRowClick = handleRowClick;
    
        // ============================================
        // AUTHENTICATION SYSTEM
        // ============================================
        
        // Initialize authentication data
        function initializeAuthData() {
            if (!localStorage.getItem('vocUsers')) {
                const defaultUsers = [
                    {
                        id: 1,
                        name: '관리자',
                        email: 'admin@layer.com',
                        password: 'admin123',
                        team: 'CX팀',
                        role: 'admin',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 2,
                        name: '김유저',
                        email: 'user1@layer.com',
                        password: 'user123',
                        team: 'CX팀',
                        role: 'user',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 3,
                        name: '이매니저',
                        email: 'user2@layer.com',
                        password: 'user123',
                        team: '상품팀',
                        role: 'manager',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 4,
                        name: '박담당',
                        email: 'user3@layer.com',
                        password: 'user123',
                        team: '배송팀',
                        role: 'user',
                        createdAt: new Date().toISOString()
                    }
                ];
                localStorage.setItem('vocUsers', JSON.stringify(defaultUsers));
            }
        }

        // Toggle between login and signup
        function toggleAuthMode() {
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');
            
            loginForm.classList.toggle('hidden');
            signupForm.classList.toggle('hidden');
        }

        // Handle Login
        function handleLogin(event) {
            event.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            const users = JSON.parse(localStorage.getItem('vocUsers') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('currentVocUser', JSON.stringify(user));
                showToast('로그인 성공!', 'success');
                setTimeout(() => {
                    initializeAuthenticatedApp();
                }, 500);
            } else {
                showToast('이메일 또는 비밀번호가 잘못되었습니다', 'error');
            }
        }

        // Handle Signup
        function handleSignup(event) {
            event.preventDefault();
            
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const team = document.getElementById('signupTeam').value;

            if (!team) {
                showToast('소속팀을 선택해주세요', 'error');
                return;
            }

            const users = JSON.parse(localStorage.getItem('vocUsers') || '[]');
            
            if (users.find(u => u.email === email)) {
                showToast('이미 존재하는 이메일입니다', 'error');
                return;
            }

            const newUser = {
                id: users.length + 1,
                name,
                email,
                password,
                team,
                role: 'user',
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('vocUsers', JSON.stringify(users));
            
            showToast('회원가입이 완료되었습니다! 로그인해주세요', 'success');
            toggleAuthMode();
            
            // Clear signup form
            document.getElementById('signupForm').reset();
        }

        // Handle Logout
        function handleLogout() {
            if (confirm('로그아웃 하시겠습니까?')) {
                localStorage.removeItem('currentVocUser');
                showToast('로그아웃 되었습니다', 'success');
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        }

        // Initialize authenticated app
        function initializeAuthenticatedApp() {
            const currentUser = JSON.parse(localStorage.getItem('currentVocUser'));
            if (!currentUser) {
                document.getElementById('authScreen').classList.remove('hidden');
                return;
            }

            // Hide auth screen
            document.getElementById('authScreen').classList.add('hidden');

            // Update navbar with user info
            updateNavbarWithAuth(currentUser);

            // Show/hide pages based on role
            updateNavigationForRole(currentUser.role);

            // If admin, show admin nav item
            if (currentUser.role === 'admin') {
                addAdminNavItem();
            }

            // If user role, show VoC Board by default
            if (currentUser.role === 'user') {
                // Hide other tabs, show VoC Board
                hideAllPages();
                showVocBoard();
            }

            // Render admin table if admin
            if (currentUser.role === 'admin') {
                renderAdminUsersTable();
            }

            // Render VoC Board if user/manager
            if (currentUser.role === 'user' || currentUser.role === 'manager') {
                renderVocBoard();
            }
        }

        // Update navbar with user authentication info
        function updateNavbarWithAuth(user) {
            const navbar = document.querySelector('.navbar');
            if (!navbar) return;

            // Check if user info already exists
            let userInfoNav = document.querySelector('.user-info-nav');
            if (!userInfoNav) {
                userInfoNav = document.createElement('div');
                userInfoNav.className = 'user-info-nav';
                navbar.appendChild(userInfoNav);
            }

            const roleLabels = {
                'admin': '최고 관리자',
                'manager': '관리자',
                'user': '일반 사용자'
            };

            userInfoNav.innerHTML = `
                <div class="user-details">
                    <div class="user-name-display">${user.name}</div>
                    <div class="user-role-display">${user.team} · ${roleLabels[user.role]}</div>
                </div>
                <div class="user-avatar">${user.name.charAt(0)}</div>
                <button class="logout-btn-nav" onclick="handleLogout()">
                    <i class="fas fa-sign-out-alt"></i> 로그아웃
                </button>
            `;
        }

        // Update navigation based on role
        function updateNavigationForRole(role) {
            const tabs = document.querySelectorAll('.nav-tab');
            
            if (role === 'user') {
                // User can only see VoC Board
                tabs.forEach(tab => {
                    const tabText = tab.textContent.trim();
                    if (tabText !== 'VoC Board') {
                        tab.style.display = 'none';
                    }
                });
            } else if (role === 'manager') {
                // Manager can see all except Admin
                tabs.forEach(tab => {
                    const tabText = tab.textContent.trim();
                    if (tabText === 'Admin') {
                        tab.style.display = 'none';
                    }
                });
            }
            // Admin can see everything (no restrictions)
        }

        // Add Admin nav item
        function addAdminNavItem() {
            const navTabs = document.querySelector('.nav-tabs');
            if (!navTabs) return;

            // Check if admin tab already exists
            if (document.getElementById('adminNavTab')) return;

            const adminTab = document.createElement('div');
            adminTab.id = 'adminNavTab';
            adminTab.className = 'nav-tab';
            adminTab.innerHTML = '<i class="fas fa-users-cog"></i> Admin';
            adminTab.onclick = () => switchTab('admin');
            
            navTabs.appendChild(adminTab);
        }

        // Hide all pages
        function hideAllPages() {
            const pages = document.querySelectorAll('.tab-content');
            pages.forEach(page => page.style.display = 'none');
            document.getElementById('adminPageContent').style.display = 'none';
            document.getElementById('vocBoardPageContent').style.display = 'none';
        }

        // Show VoC Board
        function showVocBoard() {
            hideAllPages();
            document.getElementById('vocBoardPageContent').style.display = 'block';
            
            // Update active tab
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            const vocBoardTab = Array.from(document.querySelectorAll('.nav-tab')).find(
                tab => tab.textContent.includes('VoC Board')
            );
            if (vocBoardTab) vocBoardTab.classList.add('active');
        }

        // Override switchTab to handle admin and voc board
        const originalSwitchTab = window.switchTab;
        window.switchTab = function(tabName) {
            if (tabName === 'admin') {
                const currentUser = JSON.parse(localStorage.getItem('currentVocUser'));
                if (currentUser && currentUser.role === 'admin') {
                    hideAllPages();
                    document.getElementById('adminPageContent').style.display = 'block';
                    renderAdminUsersTable();
                    
                    // Update active tab
                    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
                    document.getElementById('adminNavTab').classList.add('active');
                } else {
                    showToast('관리자 권한이 필요합니다', 'error');
                }
            } else if (tabName === 'vocBoard') {
                showVocBoard();
                renderVocBoard();
            } else if (originalSwitchTab) {
                originalSwitchTab(tabName);
            }
        };

        // Render admin users table
        function renderAdminUsersTable() {
            const users = JSON.parse(localStorage.getItem('vocUsers') || '[]');
            const tbody = document.getElementById('adminUsersTableBody');
            
            if (!tbody) return;

            const roleLabels = {
                'admin': '<span class="role-badge admin">최고 관리자</span>',
                'manager': '<span class="role-badge manager">관리자</span>',
                'user': '<span class="role-badge user">일반 사용자</span>'
            };

            tbody.innerHTML = users.map(user => `
                <tr>
                    <td><strong>${user.name}</strong></td>
                    <td>${user.email}</td>
                    <td>${user.team}</td>
                    <td>${roleLabels[user.role]}</td>
                    <td>
                        <select class="role-select" onchange="updateUserRole(${user.id}, this.value)">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>일반 사용자</option>
                            <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>관리자</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>최고 관리자</option>
                        </select>
                    </td>
                    <td>${new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                </tr>
            `).join('');
        }

        // Update user role
        function updateUserRole(userId, newRole) {
            const users = JSON.parse(localStorage.getItem('vocUsers') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex !== -1) {
                const oldRole = users[userIndex].role;
                users[userIndex].role = newRole;
                localStorage.setItem('vocUsers', JSON.stringify(users));
                
                showToast(`권한이 ${oldRole}에서 ${newRole}로 변경되었습니다`, 'success');
                renderAdminUsersTable();
            }
        }

        // Switch VoC Board tab
        function switchBoardTab(type) {
            document.querySelectorAll('.voc-board-tab').forEach(tab => tab.classList.remove('active'));
            
            if (type === 'my') {
                document.querySelector('.voc-board-tab:first-child').classList.add('active');
                document.getElementById('myVocBoard').style.display = 'grid';
                document.getElementById('teamVocBoard').style.display = 'none';
            } else {
                document.querySelector('.voc-board-tab:last-child').classList.add('active');
                document.getElementById('myVocBoard').style.display = 'none';
                document.getElementById('teamVocBoard').style.display = 'grid';
            }
        }

        // Render VoC Board
        function renderVocBoard() {
            const currentUser = JSON.parse(localStorage.getItem('currentVocUser'));
            if (!currentUser) return;

            const vocData = JSON.parse(localStorage.getItem('vocData') || '[]');
            
            // Filter VoCs assigned to current user
            const myVocs = vocData.filter(voc => 
                voc.assignedTo && voc.assignedTo.email === currentUser.email
            );

            // Filter VoCs assigned to current user's team
            const teamVocs = vocData.filter(voc => 
                voc.assignedTo && voc.assignedTo.team === currentUser.team
            );

            renderVocCards('myVocBoard', myVocs);
            renderVocCards('teamVocBoard', teamVocs);
        }

        // Render VoC cards
        function renderVocCards(containerId, vocs) {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (vocs.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; padding: 60px; text-align: center; color: var(--gray-500);">
                        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p style="font-size: 16px;">할당된 VoC가 없습니다</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = vocs.map(voc => `
                <div class="voc-board-card" onclick="openVocDetailModal(${voc.id})">
                    <div class="voc-card-header">
                        <span class="voc-card-ticket">${voc.ticketNumber || 'N/A'}</span>
                        <span class="badge ${getStatusClass(voc.status)}">${voc.status}</span>
                    </div>
                    <div class="voc-card-content">
                        ${voc.content || voc.ticketName || '내용 없음'}
                    </div>
                    <div class="voc-card-footer">
                        <span class="badge ${getChannelClass(voc.channel)}">${voc.channel}</span>
                        <span class="badge">${voc.category}</span>
                        <span class="voc-card-meta">${voc.collectedAt}</span>
                    </div>
                </div>
            `).join('');
        }

        // Get status class
        function getStatusClass(status) {
            const classes = {
                '접수': 'status-pending',
                '검토중': 'status-review',
                '할당대기': 'status-waiting',
                '처리중': 'status-progress',
                '모니터링': 'status-monitoring',
                '종료': 'status-done'
            };
            return classes[status] || '';
        }

        // Get channel class
        function getChannelClass(channel) {
            return 'channel-badge';
        }

        // Initialize auth on page load
        document.addEventListener('DOMContentLoaded', function() {
            initializeAuthData();
            
            const currentUser = localStorage.getItem('currentVocUser');
            if (currentUser) {
                initializeAuthenticatedApp();
            } else {
                document.getElementById('authScreen').classList.remove('hidden');
            }
        });

// ==========================================
// 빠른 수정 패치 JavaScript
// ==========================================

// 1. Admin 페이지 네비게이션 추가 및 렌더링
function addAdminFeatures() {
    const currentUser = JSON.parse(localStorage.getItem('currentVocUser') || 'null');
    if (!currentUser) return;

    // Admin 탭 추가
    if (currentUser.role === 'admin') {
        const navTabs = document.querySelector('.nav-tabs');
        if (navTabs && !document.getElementById('admin-nav-tab')) {
            const adminTab = document.createElement('div');
            adminTab.id = 'admin-nav-tab';
            adminTab.className = 'nav-tab';
            adminTab.setAttribute('data-page', 'admin');
            adminTab.innerHTML = '<i class="fas fa-users-cog"></i> Admin';
            navTabs.appendChild(adminTab);
        }
    }
}

// 2. 알림 및 계정 드롭다운 기능
function addNavbarDropdowns() {
    const navbar = document.querySelector('.navbar-actions');
    if (!navbar) return;

    const currentUser = JSON.parse(localStorage.getItem('currentVocUser') || 'null');
    if (!currentUser) return;

    // 알림 드롭다운 HTML
    const notificationHTML = `
        <div class="navbar-dropdown-wrapper" style="position: relative;">
            <button class="navbar-icon-btn" id="notification-btn" title="알림">
                <i class="fas fa-bell"></i>
                <span class="badge-dot"></span>
            </button>
            <div class="dropdown-menu" id="notification-dropdown" style="display: none;">
                <div class="dropdown-header">알림</div>
                <div class="dropdown-item">
                    <i class="fas fa-inbox text-primary"></i>
                    <span>새로운 VoC 5건</span>
                </div>
                <div class="dropdown-item">
                    <i class="fas fa-ticket-alt text-success"></i>
                    <span>할당된 티켓 3건</span>
                </div>
                <div class="dropdown-item">
                    <i class="fas fa-check-circle text-info"></i>
                    <span>처리 완료 2건</span>
                </div>
            </div>
        </div>
    `;

    // 계정 드롭다운 HTML
    const accountHTML = `
        <div class="navbar-dropdown-wrapper" style="position: relative;">
            <button class="navbar-icon-btn" id="account-btn" title="계정">
                <i class="fas fa-user-circle"></i>
            </button>
            <div class="dropdown-menu" id="account-dropdown" style="display: none;">
                <div class="dropdown-header">${currentUser.name}</div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" onclick="showToast('내 정보 페이지 (개발 예정)', 'info')">
                    <i class="fas fa-user"></i>
                    <span>내 정보</span>
                </div>
                <div class="dropdown-item" onclick="showToast('설정 페이지 (개발 예정)', 'info')">
                    <i class="fas fa-cog"></i>
                    <span>설정</span>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" onclick="handleLogout()" style="color: var(--danger);">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>로그아웃</span>
                </div>
            </div>
        </div>
    `;

    navbar.insertAdjacentHTML('beforeend', notificationHTML);
    navbar.insertAdjacentHTML('beforeend', accountHTML);

    // 드롭다운 토글 이벤트
    setupDropdownToggles();
}

function setupDropdownToggles() {
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const accountBtn = document.getElementById('account-btn');
    const accountDropdown = document.getElementById('account-dropdown');

    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.style.display = notificationDropdown.style.display === 'none' ? 'block' : 'none';
            if (accountDropdown) accountDropdown.style.display = 'none';
        });
    }

    if (accountBtn) {
        accountBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            accountDropdown.style.display = accountDropdown.style.display === 'none' ? 'block' : 'none';
            if (notificationDropdown) notificationDropdown.style.display = 'none';
        });
    }

    // 외부 클릭 시 닫기
    document.addEventListener('click', () => {
        if (notificationDropdown) notificationDropdown.style.display = 'none';
        if (accountDropdown) accountDropdown.style.display = 'none';
    });
}

// 3. Database 필터 카드 클릭 기능
function enableFilterCards() {
    const filterCards = document.querySelectorAll('.stat-card');
    filterCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const filterType = card.dataset.filter;
            
            // 하이라이트
            filterCards.forEach(c => c.style.border = '1px solid var(--gray-200)');
            card.style.border = '2px solid var(--primary)';
            
            // 필터 적용
            applyDatabaseFilter(filterType);
        });
    });
}

function applyDatabaseFilter(filterType) {
    const allData = JSON.parse(localStorage.getItem('vocData') || '[]');
    let filtered = [];

    switch(filterType) {
        case 'all':
            filtered = allData;
            break;
        case 'ticketed':
            filtered = allData.filter(v => v.ticketNumber);
            break;
        case 'pending':
            filtered = allData.filter(v => v.status === '검토대기');
            break;
        case 'completed':
            filtered = allData.filter(v => v.status === '선별완료');
            break;
        default:
            filtered = allData;
    }

    // 테이블 다시 렌더링
    if (window.renderTable) {
        window.filteredData = filtered;
        window.renderTable();
    }
    
    showToast(`${filtered.length}개 VoC 필터링 완료`, 'success');
}

// 4. VoC 상세 모달에 할당 드롭다운 추가
function enhanceVocModal() {
    // 상태 선택 변경 이벤트
    const originalOpenModal = window.openVocDetailModal;
    if (originalOpenModal) {
        window.openVocDetailModal = function(vocId) {
            originalOpenModal(vocId);
            
            setTimeout(() => {
                const statusSelect = document.getElementById('vocStatusSelect');
                const modalContent = document.querySelector('.modal-body');
                
                if (statusSelect && modalContent) {
                    // 할당 드롭다운 컨테이너 추가
                    if (!document.getElementById('assignee-container')) {
                        const assigneeDiv = document.createElement('div');
                        assigneeDiv.id = 'assignee-container';
                        assigneeDiv.style.display = 'none';
                        assigneeDiv.style.marginTop = '16px';
                        assigneeDiv.innerHTML = `
                            <label class="form-label">담당자 선택</label>
                            <select id="assignee-select" class="form-input">
                                <option value="">담당자를 선택하세요</option>
                            </select>
                        `;
                        statusSelect.parentElement.appendChild(assigneeDiv);
                    }
                    
                    // 상태 변경 이벤트
                    statusSelect.addEventListener('change', function() {
                        const assigneeContainer = document.getElementById('assignee-container');
                        const assigneeSelect = document.getElementById('assignee-select');
                        
                        if (this.value === '할당대기') {
                            assigneeContainer.style.display = 'block';
                            
                            // 팀원 목록 로드
                            const currentUser = JSON.parse(localStorage.getItem('currentVocUser'));
                            const users = JSON.parse(localStorage.getItem('vocUsers') || '[]');
                            const teamMembers = users.filter(u => u.team === currentUser.team);
                            
                            assigneeSelect.innerHTML = '<option value="">담당자를 선택하세요</option>';
                            teamMembers.forEach(member => {
                                const option = document.createElement('option');
                                option.value = JSON.stringify({
                                    id: member.id,
                                    name: member.name,
                                    email: member.email,
                                    team: member.team
                                });
                                option.textContent = `${member.name} (${member.email})`;
                                assigneeSelect.appendChild(option);
                            });
                        } else {
                            assigneeContainer.style.display = 'none';
                        }
                    });
                }
            }, 100);
        };
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        addAdminFeatures();
        addNavbarDropdowns();
        enableFilterCards();
        enhanceVocModal();
    }, 500);
});

console.log('✅ Quick fix 패치 로드 완료');



// ===== 최종 수정 패치 =====

(function() {
    'use strict';

    // 1. 알림 드롭다운 기능
    function setupNotificationDropdown() {
        const notifBtn = document.getElementById('notification-btn');
        const notifDropdown = document.getElementById('notification-dropdown');
        
        if (notifBtn && notifDropdown) {
            notifBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const isVisible = notifDropdown.style.display === 'block';
                closeAllDropdowns();
                notifDropdown.style.display = isVisible ? 'none' : 'block';
            });
        }
    }

    // 2. 계정 드롭다운 기능
    function setupAccountDropdown() {
        const accountBtn = document.getElementById('account-btn');
        const accountDropdown = document.getElementById('account-dropdown');
        
        if (accountBtn && accountDropdown) {
            accountBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const isVisible = accountDropdown.style.display === 'block';
                closeAllDropdowns();
                accountDropdown.style.display = isVisible ? 'none' : 'block';
            });
        }
    }

    // 3. 모든 드롭다운 닫기
    function closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(dd => dd.style.display = 'none');
    }

    // 4. 외부 클릭시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar-icon-btn') && !e.target.closest('.dropdown-menu')) {
            closeAllDropdowns();
        }
    });

    // 5. Database 필터 기능
    function setupDatabaseFilters() {
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach((card, index) => {
            card.style.cursor = 'pointer';
            card.style.transition = 'all 0.2s';
            
            // data-filter 속성 추가
            if (index === 0) card.dataset.filter = 'all';
            else if (index === 1) card.dataset.filter = 'ticketed';
            else if (index === 2) card.dataset.filter = 'pending';
            else if (index === 3) card.dataset.filter = 'completed';
            
            card.addEventListener('click', function() {
                const filterType = this.dataset.filter;
                
                // 카드 하이라이트
                statCards.forEach(c => {
                    c.style.border = '1px solid var(--gray-200)';
                    c.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                });
                this.style.border = '2px solid var(--primary)';
                this.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.2)';
                
                // 필터 적용
                applyFilter(filterType);
            });
        });
    }

    // 6. 필터 적용
    function applyFilter(filterType) {
        const allVocs = [...window.vocData];
        let filtered = [];
        
        switch(filterType) {
            case 'all':
                filtered = allVocs;
                break;
            case 'ticketed':
                filtered = allVocs.filter(v => v.ticketNumber);
                break;
            case 'pending':
                filtered = allVocs.filter(v => v.status === '검토대기' || v.statusKey === 'pending_review');
                break;
            case 'completed':
                filtered = allVocs.filter(v => v.status === '선별완료' || v.statusKey === 'screened');
                break;
            default:
                filtered = allVocs;
        }
        
        window.filteredData = filtered;
        
        if (typeof window.renderTable === 'function') {
            window.renderTable();
        }
        
        if (typeof window.showToast === 'function') {
            window.showToast(`${filtered.length}개 VoC 필터링 완료`, 'success');
        }
    }

    // 7. VoC 상세 모달 - 할당대기 시 담당자 드롭다운
    function enhanceVocModal() {
        const originalOpenModal = window.openVocDetailModal;
        
        if (originalOpenModal) {
            window.openVocDetailModal = function(vocId) {
                originalOpenModal.call(this, vocId);
                
                setTimeout(() => {
                    const statusSelect = document.querySelector('#voc-detail-modal select');
                    
                    if (statusSelect) {
                        // 기존 담당자 컨테이너 제거
                        const existingContainer = document.getElementById('assignee-container');
                        if (existingContainer) {
                            existingContainer.remove();
                        }
                        
                        // 담당자 드롭다운 컨테이너 생성
                        const assigneeContainer = document.createElement('div');
                        assigneeContainer.id = 'assignee-container';
                        assigneeContainer.style.display = 'none';
                        assigneeContainer.style.marginTop = '16px';
                        assigneeContainer.innerHTML = `
                            <label class="form-label">담당자 선택</label>
                            <select id="assignee-select" class="form-input">
                                <option value="">담당자를 선택하세요</option>
                            </select>
                        `;
                        
                        statusSelect.parentElement.appendChild(assigneeContainer);
                        
                        // 상태 변경 이벤트
                        statusSelect.addEventListener('change', function() {
                            const assigneeSelect = document.getElementById('assignee-select');
                            const selectedStatus = this.options[this.selectedIndex].text;
                            
                            if (selectedStatus === '할당대기') {
                                assigneeContainer.style.display = 'block';
                                
                                // 팀원 목록 로드
                                const currentUser = JSON.parse(localStorage.getItem('currentVocUser'));
                                const users = JSON.parse(localStorage.getItem('vocUsers') || '[]');
                                const teamMembers = users.filter(u => u.team === currentUser.team);
                                
                                assigneeSelect.innerHTML = '<option value="">담당자를 선택하세요</option>';
                                teamMembers.forEach(member => {
                                    const option = document.createElement('option');
                                    option.value = JSON.stringify({
                                        id: member.id,
                                        name: member.name,
                                        email: member.email,
                                        team: member.team
                                    });
                                    option.textContent = `${member.name} (${member.email})`;
                                    assigneeSelect.appendChild(option);
                                });
                            } else {
                                assigneeContainer.style.display = 'none';
                            }
                        });
                        
                        // 저장 시 담당자 정보 포함
                        const saveBtn = document.querySelector('#voc-detail-modal .btn-primary');
                        if (saveBtn) {
                            const newSaveBtn = saveBtn.cloneNode(true);
                            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
                            
                            newSaveBtn.addEventListener('click', function() {
                                const assigneeSelect = document.getElementById('assignee-select');
                                if (assigneeSelect && assigneeSelect.style.display !== 'none' && assigneeSelect.value) {
                                    const assigneeData = JSON.parse(assigneeSelect.value);
                                    const voc = window.vocData.find(v => v.id === vocId);
                                    if (voc) {
                                        voc.assignedTo = assigneeData;
                                        localStorage.setItem('vocData', JSON.stringify(window.vocData));
                                    }
                                }
                            });
                        }
                    }
                }, 200);
            };
        }
    }

    // 8. Admin 페이지 탭 추가 및 렌더링
    function setupAdminPage() {
        const currentUser = JSON.parse(localStorage.getItem('currentVocUser'));
        
        if (currentUser && currentUser.role === 'admin') {
            // Admin 탭 추가
            const navTabs = document.querySelector('.nav-tabs');
            if (navTabs && !document.querySelector('[data-page="admin"]')) {
                const adminTab = document.createElement('div');
                adminTab.className = 'nav-tab';
                adminTab.dataset.page = 'admin';
                adminTab.innerHTML = '<i class="fas fa-users-cog"></i> Admin';
                navTabs.appendChild(adminTab);
                
                // Admin 페이지 HTML 추가
                if (!document.getElementById('admin-page')) {
                    const container = document.querySelector('.container');
                    const adminPage = document.createElement('div');
                    adminPage.id = 'admin-page';
                    adminPage.className = 'page';
                    adminPage.innerHTML = `
                        <div class="page-header">
                            <h1 class="page-title">사용자 관리</h1>
                            <p class="page-description">시스템 사용자의 권한을 관리합니다</p>
                        </div>
                        <div class="card">
                            <table class="admin-users-table">
                                <thead>
                                    <tr>
                                        <th>이름</th>
                                        <th>이메일</th>
                                        <th>소속팀</th>
                                        <th>현재 권한</th>
                                        <th>권한 변경</th>
                                        <th>가입일</th>
                                    </tr>
                                </thead>
                                <tbody id="admin-users-tbody"></tbody>
                            </table>
                        </div>
                    `;
                    container.appendChild(adminPage);
                }
                
                // 클릭 이벤트
                adminTab.addEventListener('click', function() {
                    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                    this.classList.add('active');
                    document.getElementById('admin-page').classList.add('active');
                    document.getElementById('current-page').textContent = 'Admin';
                    renderAdminTable();
                });
            }
        }
    }

    // 9. Admin 테이블 렌더링
    function renderAdminTable() {
        const tbody = document.getElementById('admin-users-tbody');
        if (!tbody) return;
        
        const users = JSON.parse(localStorage.getItem('vocUsers') || '[]');
        const roleLabels = {
            'admin': '<span class="role-badge admin">최고 관리자</span>',
            'manager': '<span class="role-badge manager">관리자</span>',
            'user': '<span class="role-badge user">일반 사용자</span>'
        };
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td>${user.team}</td>
                <td>${roleLabels[user.role]}</td>
                <td>
                    <select class="form-input" style="width: auto; padding: 6px 12px;" onchange="window.updateUserRole(${user.id}, this.value)">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>일반 사용자</option>
                        <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>관리자</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>최고 관리자</option>
                    </select>
                </td>
                <td>${new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
            </tr>
        `).join('');
    }

    // 10. 권한 변경 함수
    window.updateUserRole = function(userId, newRole) {
        const users = JSON.parse(localStorage.getItem('vocUsers') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].role = newRole;
            localStorage.setItem('vocUsers', JSON.stringify(users));
            
            if (typeof window.showToast === 'function') {
                window.showToast('권한이 변경되었습니다', 'success');
            }
            
            renderAdminTable();
        }
    };

    // 초기화
    function init() {
        setTimeout(() => {
            setupNotificationDropdown();
            setupAccountDropdown();
            setupDatabaseFilters();
            enhanceVocModal();
            setupAdminPage();
        }, 1000);
    }

    // DOMContentLoaded 또는 즉시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ 최종 수정 패치 적용 완료');
})();



// ===== 알림 및 계정 드롭다운 기능 =====
(function setupDropdowns() {
    document.addEventListener('DOMContentLoaded', function() {
        // 알림 드롭다운 HTML 삽입
        const navbarActions = document.querySelector('.navbar-actions');
        if (navbarActions && !document.getElementById('notification-dropdown')) {
            const notifHTML = `
                <div class="dropdown-menu" id="notification-dropdown" style="display: none; position: fixed; top: 70px; right: 80px; z-index: 1000;">
                    <div class="dropdown-header">알림</div>
                    <div class="dropdown-item">
                        <i class="fas fa-inbox" style="color: var(--primary);"></i>
                        <span>새로운 VoC 5건</span>
                    </div>
                    <div class="dropdown-item">
                        <i class="fas fa-ticket-alt" style="color: var(--success);"></i>
                        <span>할당된 티켓 3건</span>
                    </div>
                    <div class="dropdown-item">
                        <i class="fas fa-check-circle" style="color: #0EA5E9;"></i>
                        <span>처리 완료 2건</span>
                    </div>
                </div>
            `;
            
            const accountHTML = `
                <div class="dropdown-menu" id="account-dropdown" style="display: none; position: fixed; top: 70px; right: 20px; z-index: 1000;">
                    <div class="dropdown-header" id="account-dropdown-name"></div>
                    <div class="dropdown-divider" style="height: 1px; background: var(--gray-200); margin: 4px 0;"></div>
                    <div class="dropdown-item" onclick="alert('내 정보 페이지 (개발 예정)')">
                        <i class="fas fa-user"></i>
                        <span>내 정보</span>
                    </div>
                    <div class="dropdown-item" onclick="alert('설정 페이지 (개발 예정)')">
                        <i class="fas fa-cog"></i>
                        <span>설정</span>
                    </div>
                    <div class="dropdown-divider" style="height: 1px; background: var(--gray-200); margin: 4px 0;"></div>
                    <div class="dropdown-item" onclick="handleLogoutFromDropdown()" style="color: var(--danger);">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>로그아웃</span>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', notifHTML);
            document.body.insertAdjacentHTML('beforeend', accountHTML);
            
            // 현재 사용자 이름 설정
            const currentUser = JSON.parse(localStorage.getItem('currentVocUser'));
            if (currentUser) {
                const accountName = document.getElementById('account-dropdown-name');
                if (accountName) accountName.textContent = currentUser.name;
            }
        }
        
        // 알림 버튼 이벤트
        const notifBtns = document.querySelectorAll('[id^="notification-btn"]');
        notifBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const dropdown = document.getElementById('notification-dropdown');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                    const accountDropdown = document.getElementById('account-dropdown');
                    if (accountDropdown) accountDropdown.style.display = 'none';
                }
            });
        });
        
        // 계정 프로필 이벤트
        const userProfiles = document.querySelectorAll('[id^="user-profile"]');
        userProfiles.forEach(profile => {
            profile.addEventListener('click', function(e) {
                e.stopPropagation();
                const dropdown = document.getElementById('account-dropdown');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                    const notifDropdown = document.getElementById('notification-dropdown');
                    if (notifDropdown) notifDropdown.style.display = 'none';
                }
            });
        });
        
        // 외부 클릭시 닫기
        document.addEventListener('click', function() {
            const notifDropdown = document.getElementById('notification-dropdown');
            const accountDropdown = document.getElementById('account-dropdown');
            if (notifDropdown) notifDropdown.style.display = 'none';
            if (accountDropdown) accountDropdown.style.display = 'none';
        });
    });
})();

function handleLogoutFromDropdown() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('currentVocUser');
        showToast('로그아웃 되었습니다', 'success');
        setTimeout(() => location.reload(), 500);
    }
}

// ===== Database 필터 기능 =====
(function setupDatabaseFilters() {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            const statCards = document.querySelectorAll('.stat-card');
            if (statCards.length === 0) return;
            
            statCards.forEach((card, index) => {
                card.style.cursor = 'pointer';
                card.style.transition = 'all 0.2s';
                
                // 필터 타입 지정
                if (index === 0) card.dataset.filter = 'all';
                else if (index === 1) card.dataset.filter = 'ticketed';
                else if (index === 2) card.dataset.filter = 'pending';
                else if (index === 3) card.dataset.filter = 'completed';
                
                card.addEventListener('click', function() {
                    // 카드 하이라이트
                    statCards.forEach(c => {
                        c.style.border = '1px solid var(--gray-200)';
                        c.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    });
                    this.style.border = '2px solid var(--primary)';
                    this.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.2)';
                    
                    // 필터 적용
                    const filterType = this.dataset.filter;
                    applyDatabaseFilter(filterType);
                });
            });
        }, 1000);
    });
})();

function applyDatabaseFilter(filterType) {
    if (typeof window.vocData === 'undefined') return;
    
    const allVocs = [...window.vocData];
    let filtered = [];
    
    switch(filterType) {
        case 'all':
            filtered = allVocs;
            break;
        case 'ticketed':
            filtered = allVocs.filter(v => v.ticketNumber);
            break;
        case 'pending':
            filtered = allVocs.filter(v => v.statusKey === 'pending_review' || v.status === '검토대기');
            break;
        case 'completed':
            filtered = allVocs.filter(v => v.statusKey === 'screened' || v.status === '선별완료');
            break;
        default:
            filtered = allVocs;
    }
    
    window.filteredData = filtered;
    
    if (typeof window.renderTable === 'function') {
        window.renderTable();
    }
    
    showToast(`${filtered.length}개 VoC 필터링 완료`, 'success');
}

console.log('✅ 드롭다운 및 필터 기능 로드 완료');
