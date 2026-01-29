// Sample Data
const vocData = [];
let currentTicketNumber = 20;
let filteredData = [];
let currentPage = 1;
let rowsPerPage = 50;
let sortColumn = null;
let sortDirection = 'asc';
let currentVocId = null;
let allUsers = [];
let selectedVocsForTicket = []; // 티켓 생성을 위해 선택된 VoC들

// Status mapping
const statusMapping = {
    'received': { text: '접수', class: 'received' },
    'reviewing': { text: '검토중', class: 'reviewing' },
    'pending-assignment': { text: '할당대기', class: 'pending-assignment' },
    'in-progress': { text: '처리중', class: 'in-progress' },
    'monitoring': { text: '모니터링', class: 'monitoring' },
    'closed': { text: '종료', class: 'closed' }
};

// Generate sample VoC data - 100건으로 수정, 상위 20건만 티켓 생성
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

    // Generate 100 VoC entries
    for (let i = 1; i <= 100; i++) {
        const isTicketed = i <= 20; // 상위 20건만 티켓 생성
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
            ticketNumber: isTicketed ? `TKT-${String(i).padStart(4, '0')}` : null,
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
            selected: false,
            assignee: null,
            linkedVocs: [] // 하나의 티켓에 연결된 VoC 목록
        });
    }

    vocData.sort((a, b) => b.id - a.id);
    filteredData = [...vocData];
}

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
    allUsers = JSON.parse(localStorage.getItem('vocUsers') || '[]');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeAuthData();
    
    const currentUser = localStorage.getItem('currentVocUser');
    if (currentUser) {
        initializeAuthenticatedApp();
    } else {
        document.getElementById('authScreen').classList.remove('hidden');
    }
});

function initializeAuthenticatedApp() {
    const currentUser = JSON.parse(localStorage.getItem('currentVocUser'));
    if (!currentUser) {
        document.getElementById('authScreen').classList.remove('hidden');
        return;
    }

    document.getElementById('authScreen').classList.add('hidden');
    
    generateSampleData();
    initializeNavigation();
    initializeCollection();
    initializeDatabase();
    renderTable();
    generateRecentActivity();
    initializeModal();
    
    // Admin 탭 표시
    if (currentUser.role === 'admin') {
        document.getElementById('admin-tab').style.display = 'block';
    }
    
    updateNavbarWithAuth(currentUser);
}

// Update navbar with user authentication info
function updateNavbarWithAuth(user) {
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.textContent = user.name.charAt(0);
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
            location.reload();
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
            
            const pageNames = {
                'overview': 'VoC 현황판',
                'collection': 'VoC 접수',
                'database': 'VoC Database',
                'dashboard': 'Dashboard',
                'admin': 'Admin'
            };
            document.getElementById('current-page').textContent = pageNames[pageName] || 'VoC 접수';

            if (pageName === 'dashboard') {
                renderKanbanBoard();
            }
            
            if (pageName === 'admin') {
                renderAdminUsersTable();
            }
        });
    });
}

// Collection Page
function initializeCollection() {
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
    // Filter cards
    document.querySelectorAll('.filter-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            document.querySelectorAll('.filter-card').forEach(c => {
                c.style.border = '';
            });
            this.style.border = '2px solid var(--primary)';
            
            const filterType = this.dataset.filter;
            applyDatabaseFilter(filterType);
        });
    });

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

    document.getElementById('create-tickets-btn').addEventListener('click', createTickets);

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

    document.getElementById('refresh-btn').addEventListener('click', () => {
        showToast('데이터를 새로고침했습니다', 'success');
        renderTable();
    });

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

function applyDatabaseFilter(filterType) {
    switch(filterType) {
        case 'all':
            filteredData = [...vocData];
            break;
        case 'ticketed':
            filteredData = vocData.filter(v => v.ticketNumber);
            break;
        default:
            filteredData = [...vocData];
    }
    
    currentPage = 1;
    renderTable();
    showToast(`${filteredData.length}개 VoC 필터링 완료`, 'success');
}

// Modal functions
function initializeModal() {
    document.querySelectorAll('.status-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.status-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 담당자 검색 기능
    const assigneeSearch = document.getElementById('modal-assignee-search');
    if (assigneeSearch) {
        assigneeSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const select = document.getElementById('modal-assignee');
            const options = Array.from(select.options);
            
            options.forEach(option => {
                if (option.value === '') return;
                const text = option.textContent.toLowerCase();
                option.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

function openVocModal(vocId, isTicketCreation = false) {
    const voc = vocData.find(v => v.id === vocId);
    if (!voc) return;

    currentVocId = vocId;

    // 티켓 생성 모드인 경우 새 티켓 번호 부여
    if (isTicketCreation && selectedVocsForTicket.length > 0) {
        currentTicketNumber++;
        const newTicketNumber = `TKT-${String(currentTicketNumber).padStart(4, '0')}`;
        document.getElementById('modal-ticket-number').textContent = newTicketNumber;
        document.getElementById('modal-ticket-number').style.color = 'var(--primary)';
        document.getElementById('modal-ticket-number').style.fontWeight = '700';
        
        // 여러 VoC 선택된 경우 리스트 표시
        if (selectedVocsForTicket.length > 1) {
            renderLinkedVocsList(selectedVocsForTicket);
        } else {
            // 단일 VoC인 경우에도 추가하기 버튼 표시
            renderLinkedVocsList([vocId]);
        }
    } else {
        // 기존 티켓 보기 모드
        document.getElementById('modal-ticket-number').textContent = voc.ticketNumber || '-';
        document.getElementById('modal-ticket-number').style.color = '';
        document.getElementById('modal-ticket-number').style.fontWeight = '';
        
        // 연결된 VoC가 있으면 표시
        if (voc.linkedVocs && voc.linkedVocs.length > 0) {
            renderLinkedVocsList(voc.linkedVocs);
        } else {
            // 티켓이 있는 경우에도 추가하기 버튼 표시
            if (voc.ticketNumber) {
                renderLinkedVocsList([vocId]);
            } else {
                const linkedSection = document.getElementById('linked-vocs-section');
                if (linkedSection) linkedSection.style.display = 'none';
            }
        }
    }

    document.getElementById('modal-date').textContent = formatDate(voc.date);
    document.getElementById('modal-channel').textContent = voc.channel;
    document.getElementById('modal-customer-id').textContent = voc.customerId;
    document.getElementById('modal-category').textContent = voc.category.name;
    document.getElementById('modal-sentiment').value = voc.sentiment.class;
    document.getElementById('modal-impact').value = voc.impact;
    document.getElementById('modal-content').textContent = voc.content;
    document.getElementById('modal-ticket-name').value = voc.ticketName || `${voc.category.name} 이슈 #${voc.id}`;

    // 담당자 드롭다운 채우기
    const assigneeSelect = document.getElementById('modal-assignee');
    assigneeSelect.innerHTML = '<option value="">담당자 선택</option>';
    allUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.team})`;
        if (voc.assignee && voc.assignee.id === user.id) {
            option.selected = true;
        }
        assigneeSelect.appendChild(option);
    });

    document.querySelectorAll('.status-option').forEach(opt => opt.classList.remove('active'));
    const statusOption = document.querySelector(`[data-status="${voc.statusKey}"]`);
    if (statusOption) {
        statusOption.classList.add('active');
    }

    document.getElementById('voc-detail-modal').classList.add('active');
    
    // 댓글 렌더링 추가
    if (voc.ticketNumber) {
        renderComments(voc.ticketNumber);
    }
}

// 연결된 VoC 리스트 렌더링
function renderLinkedVocsList(vocIds) {
    let linkedSection = document.getElementById('linked-vocs-section');
    
    // 섹션이 없으면 생성
    if (!linkedSection) {
        const modalBody = document.querySelector('.modal-body');
        const contentSection = Array.from(modalBody.children).find(
            child => child.querySelector('#modal-content')
        );
        
        linkedSection = document.createElement('div');
        linkedSection.id = 'linked-vocs-section';
        linkedSection.className = 'detail-section';
        linkedSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="margin: 0;">연결된 VoC 목록</h3>
                <button class="btn-secondary" onclick="addVocToTicket()" style="padding: 6px 12px; font-size: 13px;">
                    <i class="fas fa-plus"></i> VoC 추가하기
                </button>
            </div>
            <div id="linked-vocs-list"></div>
        `;
        
        if (contentSection) {
            modalBody.insertBefore(linkedSection, contentSection);
        } else {
            modalBody.insertBefore(linkedSection, modalBody.firstChild);
        }
    }
    
    linkedSection.style.display = 'block';
    
    const listContainer = document.getElementById('linked-vocs-list');
    listContainer.innerHTML = vocIds.map(id => {
        const voc = vocData.find(v => v.id === id);
        if (!voc) return '';
        
        return `
            <div class="linked-voc-item" style="padding: 12px; background: var(--gray-50); border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--gray-200);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div style="flex: 1;">
                        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
                            <span class="channel-badge ${voc.channel.toLowerCase().replace(/[^a-z0-9]/g, '')}">${voc.channel}</span>
                            <span class="category-tag ${voc.category.class}">${voc.category.name}</span>
                            <span style="font-size: 12px; color: var(--gray-500);">${formatDate(voc.date)}</span>
                        </div>
                        <div style="font-size: 13px; color: var(--gray-700); line-height: 1.5;">${voc.content}</div>
                    </div>
                    ${vocIds.length > 1 ? `
                        <button class="delete-btn" onclick="removeVocFromTicket(${id})" style="margin-left: 8px;">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// VoC 추가하기 기능
function addVocToTicket() {
    // 간단한 프롬프트로 VoC ID 입력받기 (실제로는 검색 모달을 만들어야 함)
    const vocIdInput = prompt('추가할 VoC의 ID를 입력하세요:');
    if (!vocIdInput) return;
    
    const vocId = parseInt(vocIdInput);
    const voc = vocData.find(v => v.id === vocId);
    
    if (!voc) {
        showToast('해당 ID의 VoC를 찾을 수 없습니다', 'error');
        return;
    }
    
    if (voc.ticketNumber) {
        showToast('이미 티켓이 생성된 VoC입니다', 'error');
        return;
    }
    
    // 현재 모달의 VoC에 연결
    if (selectedVocsForTicket.length > 0) {
        // 티켓 생성 중
        if (!selectedVocsForTicket.includes(vocId)) {
            selectedVocsForTicket.push(vocId);
            renderLinkedVocsList(selectedVocsForTicket);
            showToast('VoC가 추가되었습니다', 'success');
        }
    } else {
        // 기존 티켓에 추가
        const currentVoc = vocData.find(v => v.id === currentVocId);
        if (currentVoc && currentVoc.ticketNumber) {
            if (!currentVoc.linkedVocs) currentVoc.linkedVocs = [currentVocId];
            if (!currentVoc.linkedVocs.includes(vocId)) {
                currentVoc.linkedVocs.push(vocId);
                renderLinkedVocsList(currentVoc.linkedVocs);
                showToast('VoC가 추가되었습니다', 'success');
            }
        }
    }
}

// VoC 제거하기 기능
function removeVocFromTicket(vocId) {
    if (!confirm('이 VoC를 티켓에서 제거하시겠습니까?')) return;
    
    if (selectedVocsForTicket.length > 0) {
        // 티켓 생성 중
        const index = selectedVocsForTicket.indexOf(vocId);
        if (index > -1) {
            selectedVocsForTicket.splice(index, 1);
            if (selectedVocsForTicket.length === 0) {
                showToast('최소 1개의 VoC가 필요합니다', 'error');
                closeVocModal();
                return;
            }
            renderLinkedVocsList(selectedVocsForTicket);
            showToast('VoC가 제거되었습니다', 'success');
        }
    } else {
        // 기존 티켓에서 제거
        const currentVoc = vocData.find(v => v.id === currentVocId);
        if (currentVoc && currentVoc.linkedVocs) {
            const index = currentVoc.linkedVocs.indexOf(vocId);
            if (index > -1) {
                if (currentVoc.linkedVocs.length === 1) {
                    showToast('최소 1개의 VoC가 필요합니다', 'error');
                    return;
                }
                currentVoc.linkedVocs.splice(index, 1);
                renderLinkedVocsList(currentVoc.linkedVocs);
                showToast('VoC가 제거되었습니다', 'success');
            }
        }
    }
}

function closeVocModal() {
    document.getElementById('voc-detail-modal').classList.remove('active');
    currentVocId = null;
    selectedVocsForTicket = [];
    
    // 연결된 VoC 섹션 숨기기
    const linkedSection = document.getElementById('linked-vocs-section');
    if (linkedSection) linkedSection.style.display = 'none';
}

function saveVocDetails() {
    if (!currentVocId) return;

    const selectedStatus = document.querySelector('.status-option.active');
    const newTicketNumber = document.getElementById('modal-ticket-number').textContent;
    const ticketName = document.getElementById('modal-ticket-name').value;
    const sentimentValue = document.getElementById('modal-sentiment').value;
    const impactValue = document.getElementById('modal-impact').value;
    const assigneeId = parseInt(document.getElementById('modal-assignee').value);

    // 여러 VoC를 하나의 티켓으로 묶는 경우
    if (selectedVocsForTicket.length > 0) {
        const statusKey = selectedStatus ? selectedStatus.dataset.status : 'received';
        
        selectedVocsForTicket.forEach(vocId => {
            const voc = vocData.find(v => v.id === vocId);
            if (voc) {
                voc.ticketNumber = newTicketNumber;
                voc.ticketName = ticketName;
                voc.statusKey = statusKey;
                voc.status = statusMapping[statusKey];
                voc.linkedVocs = [...selectedVocsForTicket]; // 모든 연결된 VoC 저장
                
                // 첫 번째 VoC에만 추가 정보 저장
                if (vocId === selectedVocsForTicket[0]) {
                    const sentimentMap = {
                        'positive': { text: '긍정', emoji: '😊', class: 'positive' },
                        'neutral': { text: '중립', emoji: '😐', class: 'neutral' },
                        'negative': { text: '부정', emoji: '😞', class: 'negative' }
                    };
                    voc.sentiment = sentimentMap[sentimentValue];
                    voc.impact = impactValue;
                    
                    if (assigneeId) {
                        voc.assignee = allUsers.find(u => u.id === assigneeId);
                    }
                }
                
                voc.selected = false;
            }
        });
        
        showToast(`${selectedVocsForTicket.length}개의 VoC가 하나의 티켓으로 생성되었습니다`, 'success');
    } else {
        // 단일 VoC 저장 (기존 로직)
        const voc = vocData.find(v => v.id === currentVocId);
        if (!voc) return;

        if (selectedStatus) {
            const statusKey = selectedStatus.dataset.status;
            voc.statusKey = statusKey;
            voc.status = statusMapping[statusKey];
        }

        // 티켓 번호가 새로 부여된 경우
        if (newTicketNumber !== '-' && newTicketNumber !== voc.ticketNumber) {
            voc.ticketNumber = newTicketNumber;
        }

        voc.ticketName = ticketName;
        
        const sentimentMap = {
            'positive': { text: '긍정', emoji: '😊', class: 'positive' },
            'neutral': { text: '중립', emoji: '😐', class: 'neutral' },
            'negative': { text: '부정', emoji: '😞', class: 'negative' }
        };
        voc.sentiment = sentimentMap[sentimentValue];
        voc.impact = impactValue;
        
        if (assigneeId) {
            voc.assignee = allUsers.find(u => u.id === assigneeId);
        }

        showToast('VoC 정보가 저장되었습니다', 'success');
    }

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

    document.getElementById('page-start').textContent = start + 1;
    document.getElementById('page-end').textContent = Math.min(end, filteredData.length);
    document.getElementById('total-items').textContent = filteredData.length;
    document.getElementById('total-count').textContent = vocData.length;
    document.getElementById('ticket-count').textContent = vocData.filter(v => v.ticketNumber).length;

    renderPageNumbers();

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === Math.ceil(filteredData.length / rowsPerPage);
}

function handleRowClick(event, vocId) {
    if (event.target.closest('.checkbox-col') || event.target.closest('.action-menu-btn')) {
        return;
    }
    openVocModal(vocId, false);
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

    // 선택된 VoC ID들을 저장하고 모달 열기
    selectedVocsForTicket = selectedItems.map(item => item.id);
    
    // 첫 번째 VoC로 모달 열기 (티켓 생성 모드)
    openVocModal(selectedVocsForTicket[0], true);
}

function renderKanbanBoard() {
    const kanbanBoard = document.getElementById('kanban-board');
    const statusKeys = Object.keys(statusMapping);
    
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
                            ${item.assignee ? `
                                <div class="kanban-assignee">
                                    <i class="fas fa-user"></i> ${item.assignee.name}
                                </div>
                            ` : ''}
                            <div class="kanban-card-meta">
                                <span>${item.channel}</span>
                                <span>${item.category.name}</span>
                            </div>
                            ${item.linkedVocs && item.linkedVocs.length > 1 ? 
                                `<div style="margin-top: 8px; font-size: 11px; color: var(--primary);">
                                    <i class="fas fa-link"></i> ${item.linkedVocs.length}개 VoC 연결됨
                                </div>` : ''
                            }
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');}
function renderKanbanBoardOld() {
    const kanbanBoard = document.getElementById('kanban-board');
    const statusKeys = Object.keys(statusMapping);
    
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
                            ${item.linkedVocs && item.linkedVocs.length > 1 ? 
                                `<div style="margin-top: 8px; font-size: 11px; color: var(--primary);">
                                    <i class="fas fa-link"></i> ${item.linkedVocs.length}개 VoC 연결됨
                                </div>` : ''
                            }
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderAdminUsersTable() {
    const users = JSON.parse(localStorage.getItem('vocUsers') || '[]');
    const tbody = document.getElementById('admin-users-table-body');
    
    if (!tbody) return;

    const roleLabels = {
        'admin': '<span class="status-badge" style="background: #FEE2E2; color: #DC2626;">최고 관리자</span>',
        'manager': '<span class="status-badge" style="background: #DBEAFE; color: #1E40AF;">관리자</span>',
        'user': '<span class="status-badge" style="background: #E5E7EB; color: #6B7280;">일반 사용자</span>'
    };

    tbody.innerHTML = users.map(user => `
        <tr>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${user.team}</td>
            <td>${roleLabels[user.role]}</td>
            <td>
                <select class="input-field" style="width: auto; padding: 8px 12px;" onchange="updateUserRole(${user.id}, this.value)">
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>일반 사용자</option>
                    <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>관리자</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>최고 관리자</option>
                </select>
            </td>
            <td>${new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
        </tr>
    `).join('');
}

function updateUserRole(userId, newRole) {
    const users = JSON.parse(localStorage.getItem('vocUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].role = newRole;
        localStorage.setItem('vocUsers', JSON.stringify(users));
        allUsers = users;
        showToast('권한이 변경되었습니다', 'success');
        renderAdminUsersTable();
    }
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

window.toggleSelection = toggleSelection;
window.goToPage = goToPage;
window.openVocModal = openVocModal;
window.closeVocModal = closeVocModal;
window.saveVocDetails = saveVocDetails;
window.handleRowClick = handleRowClick;
window.toggleAuthMode = toggleAuthMode;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.updateUserRole = updateUserRole;
window.addVocToTicket = addVocToTicket;
window.removeVocFromTicket = removeVocFromTicket;
// ========== 추가된 기능들 ==========

// 댓글 데이터 저장소
let ticketComments = {};

// VoC 현황판 차트 변수
let vocTrendChart = null;
let channelChart = null;
let categoryChart = null;

// 현황판 날짜 필터
let overviewStartDate = null;
let overviewEndDate = null;

// 현황판 초기화
function initializeOverview() {
    // 기본 기간 설정 (최근 30일)
    setQuickFilter('month');
}

// 빠른 필터 설정
function setQuickFilter(type) {
    const today = new Date();
    const endDate = new Date(today);
    let startDate = new Date(today);
    
    document.querySelectorAll('.filter-quick-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(type) {
        case 'today':
            startDate = new Date(today);
            break;
        case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            startDate.setDate(today.getDate() - 30);
            break;
        case 'quarter':
            startDate.setMonth(today.getMonth() - 3);
            break;
    }
    
    document.getElementById('start-date').valueAsDate = startDate;
    document.getElementById('end-date').valueAsDate = endDate;
    
    applyDateFilter();
}

// 날짜 필터 적용
function applyDateFilter() {
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);
    
    overviewStartDate = startDate;
    overviewEndDate = endDate;
    
    updateOverviewStats();
    renderCharts();
}

// 현황판 통계 업데이트
function updateOverviewStats() {
    const filteredVocs = vocData.filter(v => {
        if (!overviewStartDate || !overviewEndDate) return true;
        return v.date >= overviewStartDate && v.date <= overviewEndDate;
    });
    
    const totalCount = filteredVocs.length;
    const ticketedCount = filteredVocs.filter(v => v.ticketNumber).length;
    const conversionRate = totalCount > 0 ? ((ticketedCount / totalCount) * 100).toFixed(1) : 0;
    const highImpactCount = filteredVocs.filter(v => v.impact === 'High').length;
    const positiveCount = filteredVocs.filter(v => v.sentiment.class === 'positive').length;
    const satisfaction = totalCount > 0 ? ((positiveCount / totalCount) * 100).toFixed(1) : 0;
    
    document.getElementById('total-voc-count').textContent = totalCount;
    document.getElementById('ticket-conversion-rate').textContent = conversionRate + '%';
    document.getElementById('high-impact-count').textContent = highImpactCount;
    document.getElementById('avg-satisfaction').textContent = satisfaction + '%';
}

// 차트 렌더링
function renderCharts() {
    const filteredVocs = vocData.filter(v => {
        if (!overviewStartDate || !overviewEndDate) return true;
        return v.date >= overviewStartDate && v.date <= overviewEndDate;
    });
    
    // VoC 인입 추이 차트
    renderTrendChart(filteredVocs);
    
    // 채널별 분포 차트
    renderChannelChart(filteredVocs);
    
    // 카테고리별 분포 차트
    renderCategoryChart(filteredVocs);
}

// 추이 차트
function renderTrendChart(vocs) {
    const ctx = document.getElementById('voc-trend-chart');
    if (!ctx) return;
    
    // 날짜별 그룹화
    const dateGroups = {};
    vocs.forEach(v => {
        const dateKey = v.date.toISOString().split('T')[0];
        if (!dateGroups[dateKey]) {
            dateGroups[dateKey] = 0;
        }
        dateGroups[dateKey]++;
    });
    
    const sortedDates = Object.keys(dateGroups).sort();
    const counts = sortedDates.map(date => dateGroups[date]);
    
    if (vocTrendChart) {
        vocTrendChart.destroy();
    }
    
    vocTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates.map(d => {
                const date = new Date(d);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            }),
            datasets: [{
                label: 'VoC 인입 수',
                data: counts,
                borderColor: '#7C3AED',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 채널 차트
function renderChannelChart(vocs) {
    const ctx = document.getElementById('channel-chart');
    if (!ctx) return;
    
    const channelCounts = {};
    vocs.forEach(v => {
        if (!channelCounts[v.channel]) {
            channelCounts[v.channel] = 0;
        }
        channelCounts[v.channel]++;
    });
    
    if (channelChart) {
        channelChart.destroy();
    }
    
    channelChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(channelCounts),
            datasets: [{
                data: Object.values(channelCounts),
                backgroundColor: [
                    '#7C3AED',
                    '#2563EB',
                    '#059669',
                    '#D97706',
                    '#DC2626'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 카테고리 차트
function renderCategoryChart(vocs) {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;
    
    const categoryCounts = {};
    vocs.forEach(v => {
        if (!categoryCounts[v.category.name]) {
            categoryCounts[v.category.name] = 0;
        }
        categoryCounts[v.category.name]++;
    });
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
                label: 'VoC 수',
                data: Object.values(categoryCounts),
                backgroundColor: '#7C3AED'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 댓글 추가
function addComment() {
    if (!currentVocId) return;
    
    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        showToast('댓글 내용을 입력하세요', 'error');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentVocUser'));
    if (!currentUser) return;
    
    const voc = vocData.find(v => v.id === currentVocId);
    if (!voc || !voc.ticketNumber) {
        showToast('티켓이 생성된 VoC만 댓글을 작성할 수 있습니다', 'error');
        return;
    }
    
    // 댓글 저장소 초기화
    if (!ticketComments[voc.ticketNumber]) {
        ticketComments[voc.ticketNumber] = [];
    }
    
    const comment = {
        id: Date.now(),
        author: currentUser.name,
        content: commentText,
        timestamp: new Date()
    };
    
    ticketComments[voc.ticketNumber].push(comment);
    
    commentInput.value = '';
    renderComments(voc.ticketNumber);
    showToast('댓글이 작성되었습니다', 'success');
}

// 댓글 렌더링
function renderComments(ticketNumber) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    const comments = ticketComments[ticketNumber] || [];
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<div style="text-align: center; color: var(--gray-500); padding: 20px;">아직 댓글이 없습니다</div>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-time">${formatCommentTime(comment.timestamp)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
}

// 댓글 시간 포맷
function formatCommentTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    
    return formatDate(date);
}

// Export functions to window
window.setQuickFilter = setQuickFilter;
window.applyDateFilter = applyDateFilter;
window.addComment = addComment;
window.initializeOverview = initializeOverview;

