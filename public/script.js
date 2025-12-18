// ============================================
// CONFIGURAÇÃO
// ============================================
const PORTAL_URL = 'https://ir-comercio-portal-zcan.onrender.com';
const API_URL = 'http://localhost:3000/api'; // Para teste local

let pregoes = [];
let isOnline = false;
let lastDataHash = '';
let sessionToken = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

console.log('🚀 Pregões iniciada');

document.addEventListener('DOMContentLoaded', () => {
    // Para teste local, comentar a verificação de autenticação
    // verificarAutenticacao();
    inicializarApp();
});

// ============================================
// NAVEGAÇÃO POR MESES
// ============================================
function updateMonthDisplay() {
    const display = document.getElementById('currentMonthDisplay');
    if (display) {
        display.textContent = `${meses[currentMonth]} ${currentYear}`;
    }
    filterPregoes();
}

window.previousMonth = function() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateMonthDisplay();
};

window.nextMonth = function() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateMonthDisplay();
};

// ============================================
// AUTENTICAÇÃO (para deploy)
// ============================================
function verificarAutenticacao() {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('sessionToken');

    if (tokenFromUrl) {
        sessionToken = tokenFromUrl;
        sessionStorage.setItem('pregoesSession', tokenFromUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        sessionToken = sessionStorage.getItem('pregoesSession');
    }

    if (!sessionToken) {
        mostrarTelaAcessoNegado();
        return;
    }

    inicializarApp();
}

function mostrarTelaAcessoNegado(mensagem = 'NÃO AUTORIZADO') {
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: var(--bg-primary); color: var(--text-primary); text-align: center; padding: 2rem;">
            <h1 style="font-size: 2.2rem; margin-bottom: 1rem;">${mensagem}</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Somente usuários autenticados podem acessar esta área.</p>
            <a href="${PORTAL_URL}" style="display: inline-block; background: var(--btn-register); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Ir para o Portal</a>
        </div>
    `;
}

function inicializarApp() {
    updateMonthDisplay();
    // Para teste local, carregar dados de exemplo
    loadDadosExemplo();
    updateAllFilters();
    filterPregoes();
}

// ============================================
// DADOS DE EXEMPLO PARA TESTE LOCAL
// ============================================
function loadDadosExemplo() {
    pregoes = [
        {
            id: 1,
            orgao: 'PREFEITURA MUNICIPAL DE VITÓRIA',
            uasg: '925001',
            numeroPregao: '001/2024',
            data: '2024-12-15',
            sistema: 'BANCO DO BRASIL',
            vendedor: 'ROBERTO',
            status: 'aberto'
        },
        {
            id: 2,
            orgao: 'GOVERNO DO ESTADO DO ESPÍRITO SANTO',
            uasg: '925002',
            numeroPregao: '002/2024',
            data: '2024-12-10',
            sistema: 'PORTAL DE COMPRAS',
            vendedor: 'ISAQUE',
            status: 'ganho'
        }
    ];
    
    lastDataHash = JSON.stringify(pregoes.map(p => p.id));
}

// ============================================
// MODAL DE CONFIRMAÇÃO
// ============================================
function showConfirm(message, options = {}) {
    return new Promise((resolve) => {
        const { title = 'Confirmação', confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'warning' } = options;

        const modalHTML = `
            <div class="modal-overlay" id="confirmModal" style="z-index: 10001;">
                <div class="modal-content" style="max-width: 450px;">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                    </div>
                    <p style="margin: 1.5rem 0; color: var(--text-primary); font-size: 1rem; line-height: 1.6;">${message}</p>
                    <div class="modal-actions">
                        <button class="secondary" id="modalCancelBtn">${cancelText}</button>
                        <button class="${type === 'warning' ? 'danger' : 'success'}" id="modalConfirmBtn">${confirmText}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('confirmModal');
        const confirmBtn = document.getElementById('modalConfirmBtn');
        const cancelBtn = document.getElementById('modalCancelBtn');

        const closeModal = (result) => {
            modal.style.animation = 'fadeOut 0.2s ease forwards';
            setTimeout(() => { 
                modal.remove(); 
                resolve(result); 
            }, 200);
        };

        confirmBtn.addEventListener('click', () => closeModal(true));
        cancelBtn.addEventListener('click', () => closeModal(false));
    });
}

// ============================================
// TOGGLE STATUS (CHECKBOX)
// ============================================
window.toggleStatus = function(id) {
    const idStr = String(id);
    const pregao = pregoes.find(p => String(p.id) === idStr);
    if (!pregao) return;

    const novoStatus = pregao.status === 'ganho' ? 'aberto' : 'ganho';
    pregao.status = novoStatus;
    
    updateAllFilters();
    filterPregoes();
    
    showMessage(`Pregão marcado como ${novoStatus === 'ganho' ? 'GANHO' : 'ABERTO'}!`, 'success');
};

// ============================================
// FORMULÁRIO INICIAL (REGISTRO BÁSICO)
// ============================================
window.toggleForm = function() {
    showFormModal(null);
};

function showFormModal(editingId = null) {
    const isEditing = editingId !== null;
    let pregao = null;
    
    if (isEditing) {
        const idStr = String(editingId);
        pregao = pregoes.find(p => String(p.id) === idStr);
        
        if (!pregao) {
            showMessage('Pregão não encontrado!', 'error');
            return;
        }
    }

    const modalHTML = `
        <div class="modal-overlay" id="formModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${isEditing ? 'Editar Pregão' : 'Novo Pregão'}</h3>
                </div>
                
                <form id="pregaoForm" onsubmit="handleSubmit(event)">
                    <input type="hidden" id="editId" value="${editingId || ''}">
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="orgao">Órgão</label>
                            <input type="text" id="orgao" value="${pregao?.orgao || ''}">
                        </div>
                        <div class="form-group">
                            <label for="uasg">UASG</label>
                            <input type="text" id="uasg" value="${pregao?.uasg || ''}">
                        </div>
                        <div class="form-group">
                            <label for="numeroPregao">Nº Pregão *</label>
                            <input type="text" id="numeroPregao" value="${pregao?.numeroPregao || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="data">Data *</label>
                            <input type="date" id="data" value="${pregao?.data || new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="form-group">
                            <label for="sistema">Sistema</label>
                            <select id="sistema">
                                <option value="">Selecione...</option>
                                <option value="BANCO DO BRASIL" ${pregao?.sistema === 'BANCO DO BRASIL' ? 'selected' : ''}>BANCO DO BRASIL</option>
                                <option value="PORTAL DE COMPRAS" ${pregao?.sistema === 'PORTAL DE COMPRAS' ? 'selected' : ''}>PORTAL DE COMPRAS</option>
                                <option value="COMPRAS GOV" ${pregao?.sistema === 'COMPRAS GOV' ? 'selected' : ''}>COMPRAS GOV</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="vendedor">Vendedor</label>
                            <select id="vendedor">
                                <option value="">Selecione...</option>
                                <option value="ROBERTO" ${pregao?.vendedor === 'ROBERTO' ? 'selected' : ''}>ROBERTO</option>
                                <option value="ISAQUE" ${pregao?.vendedor === 'ISAQUE' ? 'selected' : ''}>ISAQUE</option>
                                <option value="MIGUEL" ${pregao?.vendedor === 'MIGUEL' ? 'selected' : ''}>MIGUEL</option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="submit" class="save">${isEditing ? 'Atualizar' : 'Salvar'}</button>
                        <button type="button" class="secondary" onclick="closeFormModal()">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const camposMaiusculas = ['orgao', 'uasg', 'numeroPregao'];
    camposMaiusculas.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.addEventListener('input', (e) => {
                const start = e.target.selectionStart;
                e.target.value = e.target.value.toUpperCase();
                e.target.setSelectionRange(start, start);
            });
        }
    });
    
    setTimeout(() => document.getElementById('numeroPregao')?.focus(), 100);
}

function closeFormModal() {
    const modal = document.getElementById('formModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(() => modal.remove(), 200);
    }
}

// ============================================
// SUBMIT
// ============================================
async function handleSubmit(event) {
    if (event) event.preventDefault();

    const formData = {
        orgao: document.getElementById('orgao').value.trim(),
        uasg: document.getElementById('uasg').value.trim(),
        numeroPregao: document.getElementById('numeroPregao').value.trim(),
        data: document.getElementById('data').value,
        sistema: document.getElementById('sistema').value.trim(),
        vendedor: document.getElementById('vendedor').value.trim(),
        status: 'aberto'
    };

    const editId = document.getElementById('editId').value;

    if (editId) {
        const pregaoExistente = pregoes.find(p => String(p.id) === String(editId));
        if (pregaoExistente) {
            formData.status = pregaoExistente.status;
            formData.id = pregaoExistente.id;
            
            const index = pregoes.findIndex(p => String(p.id) === String(editId));
            if (index !== -1) pregoes[index] = formData;
            showMessage('Pregão atualizado!', 'success');
        }
    } else {
        formData.id = Date.now();
        pregoes.push(formData);
        showMessage('Pregão criado!', 'success');
    }

    lastDataHash = JSON.stringify(pregoes.map(p => p.id));
    updateAllFilters();
    filterPregoes();
    closeFormModal();
}

// ============================================
// EDIÇÃO
// ============================================
window.editPregao = function(id) {
    const idStr = String(id);
    const pregao = pregoes.find(p => String(p.id) === idStr);
    
    if (!pregao) {
        showMessage('Pregão não encontrado!', 'error');
        return;
    }
    
    showFormModal(idStr);
};

// ============================================
// EXCLUSÃO
// ============================================
window.deletePregao = async function(id) {
    const confirmed = await showConfirm(
        'Tem certeza que deseja excluir este pregão?',
        {
            title: 'Excluir Pregão',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            type: 'warning'
        }
    );

    if (!confirmed) return;

    const idStr = String(id);
    pregoes = pregoes.filter(p => String(p.id) !== idStr);
    updateAllFilters();
    filterPregoes();
    showMessage('Pregão excluído!', 'success');
};

// ============================================
// VISUALIZAÇÃO
// ============================================
window.viewPregao = function(id) {
    const idStr = String(id);
    const pregao = pregoes.find(p => String(p.id) === idStr);
    
    if (!pregao) {
        showMessage('Pregão não encontrado!', 'error');
        return;
    }

    // Criar modal de visualização com abas
    const modalHTML = `
        <div class="modal-overlay" id="viewModal">
            <div class="modal-content" style="max-width: 1200px;">
                <div class="modal-header">
                    <h3 class="modal-title">Pregão Nº ${pregao.numeroPregao}</h3>
                </div>
                
                <div class="tabs-container">
                    <div class="tabs-nav">
                        <button class="tab-btn active" onclick="switchViewTab(0)">Geral</button>
                        <button class="tab-btn" onclick="switchViewTab(1)">Itens</button>
                        <button class="tab-btn" onclick="switchViewTab(2)">Proposta</button>
                        <button class="tab-btn" onclick="switchViewTab(3)">Comprovante</button>
                    </div>

                    <div class="tab-content active" id="view-tab-geral">
                        <div class="info-section">
                            <h4>Informações Gerais</h4>
                            <p><strong>Órgão:</strong> ${pregao.orgao || 'N/A'}</p>
                            <p><strong>UASG:</strong> ${pregao.uasg || 'N/A'}</p>
                            <p><strong>Nº Pregão:</strong> ${pregao.numeroPregao}</p>
                            <p><strong>Data:</strong> ${formatDate(pregao.data)}</p>
                            <p><strong>Sistema:</strong> ${pregao.sistema || 'N/A'}</p>
                            <p><strong>Vendedor:</strong> ${pregao.vendedor || 'N/A'}</p>
                            <p><strong>Status:</strong> <span class="badge ${pregao.status}">${pregao.status.toUpperCase()}</span></p>
                        </div>
                    </div>

                    <div class="tab-content" id="view-tab-itens">
                        <div class="info-section">
                            <h4>Itens do Pregão</h4>
                            <p>Em desenvolvimento...</p>
                        </div>
                    </div>

                    <div class="tab-content" id="view-tab-proposta">
                        <div class="info-section">
                            <h4>Proposta Comercial</h4>
                            <p>Em desenvolvimento...</p>
                        </div>
                    </div>

                    <div class="tab-content" id="view-tab-comprovante">
                        <div class="info-section">
                            <h4>Comprovante de Exequibilidade</h4>
                            <p>Em desenvolvimento...</p>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="secondary" onclick="closeViewModal()">Fechar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
};

function closeViewModal() {
    const modal = document.getElementById('viewModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(() => modal.remove(), 200);
    }
}

window.switchViewTab = function(index) {
    document.querySelectorAll('#viewModal .tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    
    document.querySelectorAll('#viewModal .tab-content').forEach((content, i) => {
        content.classList.toggle('active', i === index);
    });
};

// ============================================
// BOTÃO ARQUIVOS (PLACEHOLDER)
// ============================================
window.openArquivos = function(id) {
    showMessage('Funcionalidade de Arquivos em desenvolvimento', 'success');
};

// ============================================
// FILTROS
// ============================================
function updateAllFilters() {
    updateVendedoresFilter();
}

function updateVendedoresFilter() {
    const vendedores = new Set();
    pregoes.forEach(p => {
        if (p.vendedor?.trim()) {
            vendedores.add(p.vendedor.trim());
        }
    });

    const select = document.getElementById('filterVendedor');
    if (select) {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Todos</option>';
        Array.from(vendedores).sort().forEach(v => {
            const option = document.createElement('option');
            option.value = v;
            option.textContent = v;
            select.appendChild(option);
        });
        select.value = currentValue;
    }
}

function filterPregoes() {
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const filterVendedor = document.getElementById('filterVendedor')?.value || '';
    const filterStatus = document.getElementById('filterStatus')?.value || '';
    
    let filtered = [...pregoes];

    filtered = filtered.filter(p => {
        const data = new Date(p.data + 'T00:00:00');
        return data.getMonth() === currentMonth && data.getFullYear() === currentYear;
    });

    if (filterVendedor) {
        filtered = filtered.filter(p => p.vendedor === filterVendedor);
    }

    if (filterStatus) {
        filtered = filtered.filter(p => p.status === filterStatus);
    }

    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.orgao?.toLowerCase().includes(searchTerm) ||
            p.uasg?.toLowerCase().includes(searchTerm) ||
            p.numeroPregao?.toLowerCase().includes(searchTerm) ||
            p.vendedor?.toLowerCase().includes(searchTerm)
        );
    }

    filtered.sort((a, b) => new Date(b.data) - new Date(a.data));
    renderPregoes(filtered);
    updateDashboard(filtered);
}

// ============================================
// DASHBOARD
// ============================================
function updateDashboard(filtered) {
    const totalGanhos = filtered.filter(p => p.status === 'ganho').length;
    const totalAbertos = filtered.filter(p => p.status === 'aberto').length;
    
    document.getElementById('totalPregoes').textContent = filtered.length;
    document.getElementById('totalGanhos').textContent = totalGanhos;
    document.getElementById('totalAbertos').textContent = totalAbertos;
}

// ============================================
// RENDERIZAÇÃO
// ============================================
function renderPregoes(pregoesToRender) {
    const container = document.getElementById('pregoesContainer');
    
    if (!container) return;
    
    if (!pregoesToRender || pregoesToRender.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Nenhum pregão encontrado para este período</div>';
        return;
    }

    const table = `
        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center; width: 60px;"> </th>
                        <th>UASG</th>
                        <th>Nº PREGÃO</th>
                        <th>Data</th>
                        <th>Vendedor</th>
                        <th>Status</th>
                        <th style="text-align: center; min-width: 340px;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${pregoesToRender.map(p => `
                        <tr class="${p.status === 'ganho' ? 'ganho' : ''}">
                            <td style="text-align: center;">
                                <div class="checkbox-wrapper">
                                    <input 
                                        type="checkbox" 
                                        id="check-${p.id}"
                                        ${p.status === 'ganho' ? 'checked' : ''}
                                        onchange="toggleStatus('${p.id}')"
                                        class="styled-checkbox"
                                    >
                                    <label for="check-${p.id}" class="checkbox-label-styled"></label>
                                </div>
                            </td>
                            <td><strong>${p.uasg || 'N/A'}</strong></td>
                            <td><strong>${p.numeroPregao}</strong></td>
                            <td>${formatDate(p.data)}</td>
                            <td>${p.vendedor || 'N/A'}</td>
                            <td>
                                <span class="badge ${p.status}">
                                    ${p.status.toUpperCase()}
                                </span>
                            </td>
                            <td class="actions-cell" style="text-align: center;">
                                <button onclick="viewPregao('${p.id}')" class="action-btn view">Ver</button>
                                <button onclick="editPregao('${p.id}')" class="action-btn edit">Editar</button>
                                <button onclick="openArquivos('${p.id}')" class="action-btn success">Arquivos</button>
                                <button onclick="deletePregao('${p.id}')" class="action-btn delete">Excluir</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = table;
}

// ============================================
// UTILIDADES
// ============================================
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

function showMessage(message, type) {
    const oldMessages = document.querySelectorAll('.floating-message');
    oldMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `floating-message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}
