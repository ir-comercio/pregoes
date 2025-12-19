// ============================================
// CONFIGURAÇÃO
// ============================================
let pregoes = [];
let mesSelecionado = 'TODOS';
let mesesDisponiveis = new Set();

const mesesNomes = {
    '01': 'JANEIRO', '02': 'FEVEREIRO', '03': 'MARÇO', '04': 'ABRIL',
    '05': 'MAIO', '06': 'JUNHO', '07': 'JULHO', '08': 'AGOSTO',
    '09': 'SETEMBRO', '10': 'OUTUBRO', '11': 'NOVEMBRO', '12': 'DEZEMBRO'
};

console.log('🚀 Pregões iniciada');

document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
});

function inicializarApp() {
    loadDadosExemplo();
    atualizarMesesDisponiveis();
    renderMesesFilter();
    filterPregoes();
}

// ============================================
// DADOS DE EXEMPLO
// ============================================
function loadDadosExemplo() {
    pregoes = [
        {
            id: 1,
            // Dados básicos
            orgao: 'PREFEITURA MUNICIPAL DE VITÓRIA',
            uasg: '925001',
            numeroPregao: '001/2024',
            data: '2024-12-15',
            sistema: 'BANCO DO BRASIL',
            vendedor: 'ROBERTO',
            status: 'aberto',
            // Aba Geral
            cidadeUf: 'VITÓRIA-ES',
            telefone: '(27) 3333-4444',
            email: 'LICITACAO@VITORIA.ES.GOV.BR',
            modoDisputa: 'ABERTO',
            selecionaveis: {
                certificadoIbama: true,
                registroPreco: true,
                instalacao: false,
                visitaTecnica: false,
                amostra: false,
                atestado: true,
                cadastrarAcima: false,
                banco: false,
                garantia: false,
                icms: true,
                validade: '60 DIAS',
                prazoEntrega: '30 DIAS',
                prazoPagamento: '30 DIAS'
            },
            // Itens (vazio por padrão)
            itens: [],
            // Proposta
            proposta: null,
            // Arquivos (simulação)
            arquivos: []
        },
        {
            id: 2,
            orgao: 'GOVERNO DO ESTADO DO ESPÍRITO SANTO',
            uasg: '925002',
            numeroPregao: '002/2024',
            data: '2024-11-10',
            sistema: 'PORTAL DE COMPRAS',
            vendedor: 'ISAQUE',
            status: 'ganho',
            cidadeUf: 'VITÓRIA-ES',
            telefone: '',
            email: '',
            modoDisputa: 'ABERTO',
            selecionaveis: {
                certificadoIbama: false,
                registroPreco: true,
                instalacao: false,
                visitaTecnica: false,
                amostra: false,
                atestado: false,
                cadastrarAcima: false,
                banco: false,
                garantia: false,
                icms: false,
                validade: '',
                prazoEntrega: '',
                prazoPagamento: ''
            },
            itens: [],
            proposta: null,
            arquivos: []
        }
    ];
}

// ============================================
// FILTRO POR MÊS
// ============================================
function atualizarMesesDisponiveis() {
    mesesDisponiveis.clear();
    pregoes.forEach(p => {
        if (p.data) {
            const mes = p.data.substring(5, 7);
            mesesDisponiveis.add(mes);
        }
    });
}

function renderMesesFilter() {
    const container = document.getElementById('mesesFilter');
    if (!container) return;

    const mesesArray = Array.from(mesesDisponiveis).sort();
    const fragment = document.createDocumentFragment();
    
    // Botão TODOS
    const btnTodos = document.createElement('button');
    btnTodos.className = `mes-button ${mesSelecionado === 'TODOS' ? 'active' : ''}`;
    btnTodos.textContent = 'TODOS';
    btnTodos.onclick = () => window.selecionarMes('TODOS');
    fragment.appendChild(btnTodos);
    
    // Botões dos meses
    mesesArray.forEach(mes => {
        const button = document.createElement('button');
        button.className = `mes-button ${mes === mesSelecionado ? 'active' : ''}`;
        button.textContent = mesesNomes[mes];
        button.onclick = () => window.selecionarMes(mes);
        fragment.appendChild(button);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

window.selecionarMes = function(mes) {
    mesSelecionado = mes;
    renderMesesFilter();
    filterPregoes();
};

// ============================================
// FILTROS
// ============================================
function filterPregoes() {
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const filterVendedor = document.getElementById('filterVendedor')?.value || '';
    const filterStatus = document.getElementById('filterStatus')?.value || '';
    
    let filtered = [...pregoes];

    // Filtro por mês
    if (mesSelecionado !== 'TODOS') {
        filtered = filtered.filter(p => {
            const mes = p.data.substring(5, 7);
            return mes === mesSelecionado;
        });
    }

    // Filtro por vendedor
    if (filterVendedor) {
        filtered = filtered.filter(p => p.vendedor === filterVendedor);
    }

    // Filtro por status
    if (filterStatus) {
        filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Filtro por pesquisa
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
// FORMULÁRIO INICIAL (REGISTRO BÁSICO)
// ============================================
window.toggleForm = function() {
    showFormModal(null);
};

function showFormModal(editingId = null) {
    const isEditing = editingId !== null;
    let pregao = null;
    
    if (isEditing) {
        pregao = pregoes.find(p => p.id == editingId);
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
        status: 'aberto',
        cidadeUf: '',
        telefone: '',
        email: '',
        modoDisputa: 'ABERTO',
        selecionaveis: {
            certificadoIbama: false,
            registroPreco: false,
            instalacao: false,
            visitaTecnica: false,
            amostra: false,
            atestado: false,
            cadastrarAcima: false,
            banco: false,
            garantia: false,
            icms: false,
            validade: '',
            prazoEntrega: '',
            prazoPagamento: ''
        },
        itens: [],
        proposta: null,
        arquivos: []
    };

    const editId = document.getElementById('editId').value;

    if (editId) {
        const index = pregoes.findIndex(p => p.id == editId);
        if (index !== -1) {
            const pregaoExistente = pregoes[index];
            formData.id = pregaoExistente.id;
            formData.status = pregaoExistente.status;
            formData.cidadeUf = pregaoExistente.cidadeUf;
            formData.telefone = pregaoExistente.telefone;
            formData.email = pregaoExistente.email;
            formData.modoDisputa = pregaoExistente.modoDisputa;
            formData.selecionaveis = pregaoExistente.selecionaveis;
            formData.itens = pregaoExistente.itens;
            formData.proposta = pregaoExistente.proposta;
            formData.arquivos = pregaoExistente.arquivos;
            pregoes[index] = formData;
        }
        showMessage('Pregão atualizado!', 'success');
    } else {
        formData.id = Date.now();
        pregoes.push(formData);
        showMessage('Pregão criado!', 'success');
    }

    atualizarMesesDisponiveis();
    renderMesesFilter();
    filterPregoes();
    closeFormModal();
}

// ============================================
// TOGGLE STATUS
// ============================================
window.toggleStatus = function(id) {
    const pregao = pregoes.find(p => p.id == id);
    if (!pregao) return;

    const novoStatus = pregao.status === 'ganho' ? 'aberto' : 'ganho';
    pregao.status = novoStatus;
    
    filterPregoes();
    showMessage(`Pregão marcado como ${novoStatus === 'ganho' ? 'GANHO' : 'ABERTO'}!`, 'success');
};

// ============================================
// EDIÇÃO
// ============================================
window.editPregao = function(id) {
    const pregao = pregoes.find(p => p.id == id);
    if (!pregao) {
        showMessage('Pregão não encontrado!', 'error');
        return;
    }
    showFormModal(id);
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

    pregoes = pregoes.filter(p => p.id != id);
    atualizarMesesDisponiveis();
    renderMesesFilter();
    filterPregoes();
    showMessage('Pregão excluído!', 'success');
};
// ============================================
// VISUALIZAÇÃO COMPLETA (BOTÃO VER)
// ============================================
let pregaoAtualVisualizacao = null;

window.viewPregao = function(id) {
    const pregao = pregoes.find(p => p.id == id);
    
    if (!pregao) {
        showMessage('Pregão não encontrado!', 'error');
        return;
    }

    pregaoAtualVisualizacao = pregao;
    
    // Esconder tela principal e mostrar tela de visualização
    document.getElementById('mainScreen').classList.add('hidden');
    document.getElementById('viewScreen').classList.remove('hidden');
    
    // Atualizar título
    document.getElementById('viewScreenTitle').textContent = `Pregão Nº ${pregao.numeroPregao}`;
    
    // Renderizar apenas a primeira aba (as outras serão renderizadas quando o usuário clicar)
    renderTabGeral(pregao);
    
    // Resetar para primeira aba
    switchViewTab(0);
};

window.voltarParaPregoes = function() {
    document.getElementById('viewScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
    pregaoAtualVisualizacao = null;
};

function renderTabGeral(pregao) {
    const container = document.getElementById('view-tab-geral');
    if (!container) return;

    const selecionaveis = pregao.selecionaveis || {};
    
    container.innerHTML = `
        <div style="padding: 1rem 0;">
            <form id="geralForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Vendedor</label>
                        <input type="text" id="geral_vendedor" value="${pregao.vendedor || ''}" disabled style="background: var(--bg-card);">
                    </div>
                    <div class="form-group">
                        <label>UASG</label>
                        <input type="text" id="geral_uasg" value="${pregao.uasg || ''}" disabled style="background: var(--bg-card);">
                    </div>
                    <div class="form-group">
                        <label>Órgão</label>
                        <input type="text" id="geral_orgao" value="${pregao.orgao || ''}" disabled style="background: var(--bg-card);">
                    </div>
                    <div class="form-group">
                        <label>Cidade-UF</label>
                        <input type="text" id="geral_cidadeUf" value="${pregao.cidadeUf || ''}" onchange="autoSaveGeral(${pregao.id})">
                    </div>
                    <div class="form-group">
                        <label>Telefone</label>
                        <input type="text" id="geral_telefone" value="${pregao.telefone || ''}" onchange="autoSaveGeral(${pregao.id})">
                    </div>
                    <div class="form-group">
                        <label>E-mail</label>
                        <input type="email" id="geral_email" value="${pregao.email || ''}" onchange="autoSaveGeral(${pregao.id})">
                    </div>
                    <div class="form-group">
                        <label>Data</label>
                        <input type="text" id="geral_data" value="${formatDate(pregao.data)}" disabled style="background: var(--bg-card);">
                    </div>
                    <div class="form-group">
                        <label>Modo de Disputa</label>
                        <input type="text" id="geral_modoDisputa" value="${pregao.modoDisputa || ''}" onchange="autoSaveGeral(${pregao.id})">
                    </div>
                </div>
                
                <div style="margin: 2rem 0;">
                    <label style="display: block; margin-bottom: 1rem; font-weight: 600;">Selecionáveis:</label>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75rem;">
                        <div class="seleccionavel ${selecionaveis.certificadoIbama ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'certificadoIbama')">
                            CERTIFICADO IBAMA/CTF
                        </div>
                        <div class="seleccionavel ${selecionaveis.registroPreco ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'registroPreco')">
                            REGISTRO DE PREÇO
                        </div>
                        <div class="seleccionavel ${selecionaveis.instalacao ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'instalacao')">
                            INSTALAÇÃO OU INSPEÇÃO
                        </div>
                        <div class="seleccionavel ${selecionaveis.visitaTecnica ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'visitaTecnica')">
                            VISITA TÉCNICA
                        </div>
                        <div class="seleccionavel ${selecionaveis.amostra ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'amostra')">
                            AMOSTRA
                        </div>
                        <div class="seleccionavel ${selecionaveis.atestado ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'atestado')">
                            ATESTADO DE CAPACIDADE TÉCNICA
                        </div>
                        <div class="seleccionavel ${selecionaveis.cadastrarAcima ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'cadastrarAcima')">
                            CADASTRAR ACIMA DO ESTIMADO
                        </div>
                        <div class="seleccionavel ${selecionaveis.banco ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'banco')">
                            BANCO
                        </div>
                        <div class="seleccionavel ${selecionaveis.garantia ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'garantia')">
                            GARANTIA DE PROPOSTA
                        </div>
                        <div class="seleccionavel ${selecionaveis.icms ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'icms')">
                            INFORMAÇÃO ICMS: DIFAL - EQUALIZAÇÃO
                        </div>
                    </div>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Validade da Proposta</label>
                        <input type="text" id="sel_validade" value="${selecionaveis.validade || ''}" onchange="autoSaveGeral(${pregao.id})">
                    </div>
                    <div class="form-group">
                        <label>Prazo de Entrega</label>
                        <input type="text" id="sel_prazoEntrega" value="${selecionaveis.prazoEntrega || ''}" onchange="autoSaveGeral(${pregao.id})">
                    </div>
                    <div class="form-group">
                        <label>Prazo de Pagamento</label>
                        <input type="text" id="sel_prazoPagamento" value="${selecionaveis.prazoPagamento || ''}" onchange="autoSaveGeral(${pregao.id})">
                    </div>
                </div>
            </form>
        </div>
    `;
}

window.toggleSeleccionavel = function(id, campo) {
    const pregao = pregoes.find(p => p.id == id);
    if (!pregao) return;

    pregao.selecionaveis[campo] = !pregao.selecionaveis[campo];
    renderTabGeral(pregao);
    showMessage('Salvo automaticamente!', 'success');
};

window.autoSaveGeral = function(id) {
    const pregao = pregoes.find(p => p.id == id);
    if (!pregao) return;

    pregao.cidadeUf = document.getElementById('geral_cidadeUf').value.trim();
    pregao.telefone = document.getElementById('geral_telefone').value.trim();
    pregao.email = document.getElementById('geral_email').value.trim();
    pregao.modoDisputa = document.getElementById('geral_modoDisputa').value.trim();
    
    pregao.selecionaveis.validade = document.getElementById('sel_validade').value.trim();
    pregao.selecionaveis.prazoEntrega = document.getElementById('sel_prazoEntrega').value.trim();
    pregao.selecionaveis.prazoPagamento = document.getElementById('sel_prazoPagamento').value.trim();

    showMessage('Salvo automaticamente!', 'success');
};

// Função para auto-resize de textarea (quebra automática sem scroll)
window.autoResizeTextarea = function(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
};

function renderTabItens(pregao) {
    const container = document.getElementById('view-tab-itens');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 1rem 0;">
            <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem;">
                <button type="button" class="success small" onclick="adicionarItem(${pregao.id})">+ Adicionar Item</button>
                <button type="button" class="secondary small" onclick="adicionarIntervalo(${pregao.id})">+ Adicionar Intervalo</button>
                <button type="button" class="danger small" onclick="excluirIntervalo(${pregao.id})">🗑 Excluir Itens</button>
            </div>
            
            <div style="overflow-x: auto; max-width: 100%;">
                <table style="table-layout: fixed; width: 100%; max-width: 1600px;">
                    <thead>
                        <tr>
                            <th style="width: 50px; text-align: center;">✓</th>
                            <th style="width: 60px;">ITEM</th>
                            <th style="width: 250px;">DESCRIÇÃO</th>
                            <th style="width: 100px;">QTD</th>
                            <th style="width: 100px;">UND</th>
                            <th style="width: 120px;">MARCA</th>
                            <th style="width: 120px;">MODELO</th>
                            <th style="width: 130px; background: #FFFF00; color: #000;">EST. UNT</th>
                            <th style="width: 130px; background: #FFFF00; color: #000;">EST. TOTAL</th>
                            <th style="width: 130px;">CUSTO UNT</th>
                            <th style="width: 130px;">CUSTO TOTAL</th>
                            <th style="width: 130px; background: #FFA500; color: #000;">VENDA UNT</th>
                            <th style="width: 130px;">VENDA TOTAL</th>
                        </tr>
                    </thead>
                    <tbody id="items-body-${pregao.id}"></tbody>
                </table>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-weight: 600;">
                    <div>
                        <span>TOTAL ESTIMADO:</span>
                        <span id="total-estimado-${pregao.id}" style="margin-left: 0.5rem; color: var(--warning-color);">R$ 0,00</span>
                    </div>
                    <div>
                        <span>TOTAL CUSTO:</span>
                        <span id="total-custo-${pregao.id}" style="margin-left: 0.5rem;">R$ 0,00</span>
                    </div>
                    <div>
                        <span>TOTAL VENDA:</span>
                        <span id="total-venda-${pregao.id}" style="margin-left: 0.5rem; color: var(--success-color);">R$ 0,00</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    renderizarItens(pregao.id);
}

function renderizarItens(pregaoId) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;

    const tbody = document.getElementById(`items-body-${pregaoId}`);
    if (!tbody) return;

    tbody.innerHTML = pregao.itens.map((item, index) => {
        const estimadoTotal = (item.estimadoUnt || 0) * (item.quantidade || 0);
        const custoTotal = (item.custoUnt || 0) * (item.quantidade || 0);
        const vendaTotal = (item.vendaUnt || 0) * (item.quantidade || 0);
        const excedeEstimado = (item.vendaUnt || 0) > (item.estimadoUnt || 0);
        
        return `
            <tr id="item-row-${pregaoId}-${index}" class="${excedeEstimado ? 'excede-estimado' : ''}" style="${item.atencao ? 'background: rgba(220, 38, 38, 0.1);' : item.feito ? 'background: rgba(34, 197, 94, 0.1);' : ''}">
                <td style="text-align: center;">
                    <div class="checkbox-wrapper">
                        <input 
                            type="checkbox" 
                            id="item-check-${pregaoId}-${index}"
                            ${item.ganho ? 'checked' : ''}
                            onchange="toggleItemGanho(${pregaoId}, ${index})"
                            class="styled-checkbox"
                        >
                        <label for="item-check-${pregaoId}-${index}" class="checkbox-label-styled"></label>
                    </div>
                </td>
                <td style="text-align: center;"><strong>${item.numero}</strong></td>
                <td><textarea rows="1" oninput="autoResizeTextarea(this); atualizarItem(${pregaoId}, ${index}, 'descricao', this.value)" style="width: 100%; min-height: 32px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--input-bg); color: var(--text-primary); font-size: 0.85rem; resize: none; font-family: inherit; overflow: hidden; line-height: 1.3;">${item.descricao || ''}</textarea></td>
                <td><input type="text" value="${item.quantidade || 0}" oninput="atualizarItem(${pregaoId}, ${index}, 'quantidade', this.value)" style="width: 100%; height: 32px; padding: 6px; text-align: right; font-size: 0.85rem; box-sizing: border-box;"></td>
                <td><textarea rows="1" oninput="autoResizeTextarea(this); atualizarItem(${pregaoId}, ${index}, 'unidade', this.value)" style="width: 100%; min-height: 32px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--input-bg); color: var(--text-primary); font-size: 0.85rem; resize: none; font-family: inherit; overflow: hidden; line-height: 1.3;">${item.unidade || ''}</textarea></td>
                <td><input type="text" value="${item.marca || ''}" oninput="atualizarItem(${pregaoId}, ${index}, 'marca', this.value)" style="width: 100%; height: 32px; padding: 6px; font-size: 0.85rem; box-sizing: border-box; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></td>
                <td><input type="text" value="${item.modelo || ''}" oninput="atualizarItem(${pregaoId}, ${index}, 'modelo', this.value)" style="width: 100%; height: 32px; padding: 6px; font-size: 0.85rem; box-sizing: border-box; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></td>
                <td style="background: #FFFF00;"><input type="text" value="${estUnt.toFixed(2)}" oninput="atualizarItem(${pregaoId}, ${index}, 'estimadoUnt', this.value)" style="width: 100%; height: 32px; padding: 6px; background: #FFFF00; color: #000; text-align: right; font-size: 0.85rem; box-sizing: border-box; border: none;"></td>
                <td style="background: #FFFF00;"><input type="text" value="R$ ${estTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}" readonly style="width: 100%; height: 32px; padding: 6px; background: #FFFF00; color: #000; text-align: right; font-size: 0.85rem; border: none; box-sizing: border-box;"></td>
                <td><input type="text" value="${custoUnt.toFixed(2)}" oninput="atualizarItem(${pregaoId}, ${index}, 'custoUnt', this.value)" style="width: 100%; height: 32px; padding: 6px; text-align: right; font-size: 0.85rem; color: var(--text-primary); box-sizing: border-box;"></td>
                <td><input type="text" value="R$ ${custoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}" readonly style="width: 100%; height: 32px; padding: 6px; background: var(--bg-card); text-align: right; font-size: 0.85rem; color: var(--text-primary); border: none; box-sizing: border-box;"></td>
                <td style="background: #FFA500;"><input type="text" value="${vendaUnt.toFixed(2)}" oninput="atualizarItem(${pregaoId}, ${index}, 'vendaUnt', this.value)" style="width: 100%; height: 32px; padding: 6px; background: #FFA500; color: #000; text-align: right; font-size: 0.85rem; box-sizing: border-box; border: none;"></td>
                <td><input type="text" value="R$ ${vendaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}" readonly style="width: 100%; height: 32px; padding: 6px; background: var(--bg-card); text-align: right; font-size: 0.85rem; color: var(--text-primary); border: none; box-sizing: border-box;"></td>
            </tr>
        `;
    }).join('');

    recalcularTotais(pregaoId);
    
    // Auto-resize textareas após renderização
    setTimeout(() => {
        document.querySelectorAll(`#items-body-${pregaoId} textarea`).forEach(ta => autoResizeTextarea(ta));
    }, 0);
}

window.adicionarItem = function(pregaoId) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;

    const novoNumero = pregao.itens.length > 0 ? Math.max(...pregao.itens.map(i => i.numero)) + 1 : 1;
    
    pregao.itens.push({
        numero: novoNumero,
        descricao: '',
        quantidade: 1,
        unidade: 'UN',
        marca: '',
        modelo: '',
        estimadoUnt: 0,
        custoUnt: 0,
        vendaUnt: 0,
        ganho: false,
        atencao: false,
        feito: false
    });

    renderizarItens(pregaoId);
    showMessage('Item adicionado!', 'success');
};

window.adicionarIntervalo = function(pregaoId) {
    const intervalo = prompt('Digite o intervalo (ex: 1,2,5-10,15):');
    if (!intervalo) return;

    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;

    const numeros = [];
    intervalo.split(',').forEach(parte => {
        parte = parte.trim();
        if (parte.includes('-')) {
            const [inicio, fim] = parte.split('-').map(n => parseInt(n.trim()));
            for (let i = inicio; i <= fim; i++) {
                numeros.push(i);
            }
        } else {
            numeros.push(parseInt(parte));
        }
    });

    numeros.forEach(num => {
        if (!pregao.itens.find(i => i.numero === num)) {
            pregao.itens.push({
                numero: num,
                descricao: '',
                quantidade: 1,
                unidade: 'UN',
                marca: '',
                modelo: '',
                estimadoUnt: 0,
                custoUnt: 0,
                vendaUnt: 0,
                ganho: false,
                atencao: false,
                feito: false
            });
        }
    });

    pregao.itens.sort((a, b) => a.numero - b.numero);
    renderizarItens(pregaoId);
    showMessage(`${numeros.length} itens adicionados!`, 'success');
};

window.atualizarItem = function(pregaoId, index, campo, valor) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao || !pregao.itens[index]) return;

    const item = pregao.itens[index];
    
    // Atualizar o campo
    if (campo === 'quantidade' || campo === 'estimadoUnt' || campo === 'custoUnt' || campo === 'vendaUnt') {
        item[campo] = parseFloat(valor.toString().replace(',', '.')) || 0;
        
        // Se mudou CUSTO UNT, calcular VENDA UNT automaticamente (149%)
        if (campo === 'custoUnt') {
            item.vendaUnt = item.custoUnt * 1.49;
        }
        
        // RE-RENDERIZAR a tabela para mostrar os cálculos
        renderizarItens(pregaoId);
    } else {
        item[campo] = valor;
    }
};

window.recalcularItem = function(pregaoId, index) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao || !pregao.itens[index]) return;

    const item = pregao.itens[index];
    const row = document.getElementById(`item-row-${pregaoId}-${index}`);
    
    if (row) {
        const excedeEstimado = (item.vendaUnt || 0) > (item.estimadoUnt || 0);
        if (excedeEstimado) {
            row.classList.add('excede-estimado');
        } else {
            row.classList.remove('excede-estimado');
        }
    }

    recalcularTotais(pregaoId);
};

function recalcularTotais(pregaoId) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;

    let totalEstimado = 0;
    let totalCusto = 0;
    let totalVenda = 0;

    pregao.itens.forEach(item => {
        totalEstimado += (item.estimadoUnt || 0) * (item.quantidade || 0);
        totalCusto += (item.custoUnt || 0) * (item.quantidade || 0);
        totalVenda += (item.vendaUnt || 0) * (item.quantidade || 0);
    });

    const elemEstimado = document.getElementById(`total-estimado-${pregaoId}`);
    const elemCusto = document.getElementById(`total-custo-${pregaoId}`);
    const elemVenda = document.getElementById(`total-venda-${pregaoId}`);

    if (elemEstimado) elemEstimado.textContent = `R$ ${totalEstimado.toFixed(2)}`;
    if (elemCusto) elemCusto.textContent = `R$ ${totalCusto.toFixed(2)}`;
    if (elemVenda) elemVenda.textContent = `R$ ${totalVenda.toFixed(2)}`;
}

window.toggleItemGanho = function(pregaoId, index) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao || !pregao.itens[index]) return;

    pregao.itens[index].ganho = !pregao.itens[index].ganho;
};

window.marcarAtencao = function(pregaoId, index) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao || !pregao.itens[index]) return;

    pregao.itens[index].atencao = !pregao.itens[index].atencao;
    pregao.itens[index].feito = false; // Remove feito se atenção for marcada
    renderizarItens(pregaoId);
};

window.excluirItem = function(pregaoId, index) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;

    if (confirm('Excluir este item?')) {
        pregao.itens.splice(index, 1);
        renderizarItens(pregaoId);
        showMessage('Item excluído!', 'error');
    }
};

window.excluirIntervalo = function(pregaoId) {
    const intervalo = prompt('Digite o(s) item(ns) a excluir (ex: 1,2,5-10,15):');
    if (!intervalo) return;
    
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;
    
    // Processar intervalo
    const numerosParaExcluir = [];
    intervalo.split(',').forEach(parte => {
        parte = parte.trim();
        if (parte.includes('-')) {
            const [inicio, fim] = parte.split('-').map(n => parseInt(n.trim()));
            for (let i = inicio; i <= fim; i++) {
                numerosParaExcluir.push(i);
            }
        } else {
            numerosParaExcluir.push(parseInt(parte));
        }
    });
    
    if (numerosParaExcluir.length === 0) {
        showMessage('Nenhum item válido para excluir!', 'error');
        return;
    }
    
    // Confirmar exclusão
    if (!confirm(`Excluir ${numerosParaExcluir.length} item(ns)?`)) return;
    
    // Remover itens com os números especificados
    pregao.itens = pregao.itens.filter(item => !numerosParaExcluir.includes(item.numero));
    
    renderizarItens(pregaoId);
    showMessage(`✓ ${numerosParaExcluir.length} item(ns) excluído(s)`, 'error');
};

window.marcarFeito = function(pregaoId, index) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao || !pregao.itens[index]) return;

    pregao.itens[index].feito = !pregao.itens[index].feito;
    pregao.itens[index].atencao = false; // Remove atenção se feito for marcado
    renderizarItens(pregaoId);
};

function renderTabProposta(pregao) {
    const container = document.getElementById('view-tab-proposta');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 1rem 0;">
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">Funcionalidade de proposta em desenvolvimento...</p>
            <button class="success">Gerar Proposta PDF</button>
        </div>
    `;
}

function renderTabComprovante(pregao) {
    const container = document.getElementById('view-tab-comprovante');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 1rem 0;">
            <p style="color: var(--text-secondary);">Funcionalidade de comprovante de exequibilidade em desenvolvimento...</p>
        </div>
    `;
}

window.switchViewTab = function(index) {
    document.querySelectorAll('#viewScreen .tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    
    document.querySelectorAll('#viewScreen .tab-content').forEach((content, i) => {
        content.classList.toggle('active', i === index);
    });
    
    // Renderizar a aba sob demanda
    if (!pregaoAtualVisualizacao) return;
    
    if (index === 1 && !document.getElementById(`items-body-${pregaoAtualVisualizacao.id}`)?.children.length) {
        renderTabItens(pregaoAtualVisualizacao);
    } else if (index === 2 && !document.getElementById('view-tab-proposta').innerHTML.trim()) {
        renderTabProposta(pregaoAtualVisualizacao);
    } else if (index === 3 && !document.getElementById('view-tab-comprovante').innerHTML.trim()) {
        renderTabComprovante(pregaoAtualVisualizacao);
    }
};
// ============================================
// BOTÃO ARQUIVOS (MODAL SIMULANDO GOOGLE DRIVE)
// ============================================
window.openArquivos = function(id) {
    const pregao = pregoes.find(p => p.id == id);
    if (!pregao) return;

    const modalHTML = `
        <div class="modal-overlay" id="arquivosModal">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h3 class="modal-title">Arquivos - Pregão Nº ${pregao.numeroPregao}</h3>
                    <button class="close-modal" onclick="closeArquivosModal()">✕</button>
                </div>
                
                <div style="padding: 1rem 0;">
                    <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem;">
                        <button type="button" class="success small" onclick="uploadArquivo(${id})">📁 Upload Arquivo</button>
                        <button type="button" class="secondary small" onclick="criarPasta(${id})">📂 Criar Pasta</button>
                    </div>
                    
                    <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem;">
                        <div style="margin-bottom: 1rem; font-weight: 600; color: var(--text-secondary); font-size: 0.9rem;">
                            📁 VENDEDOR-DATA-UASG-PREGÃO/${pregao.vendedor}-${pregao.data}-${pregao.uasg}-${pregao.numeroPregao}/
                        </div>
                        
                        <div id="arquivos-list-${id}" style="min-height: 200px;">
                            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                                <p>Nenhum arquivo encontrado</p>
                                <p style="font-size: 0.85rem; margin-top: 0.5rem;">Clique em "Upload Arquivo" para adicionar</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(204, 112, 0, 0.1); border-radius: 6px; font-size: 0.85rem; color: var(--text-secondary);">
                        <strong>Arquivos padrão:</strong> PROPOSTA-(UASG)-(Nº PREGÃO).PDF e COMPROVANTE DE EXEQUIBILIDADE-(UASG)-(Nº PREGÃO).PDF
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="secondary" onclick="closeArquivosModal()">Fechar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    renderArquivos(id);
};

function renderArquivos(pregaoId) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao || !pregao.arquivos || pregao.arquivos.length === 0) return;

    const container = document.getElementById(`arquivos-list-${pregaoId}`);
    if (!container) return;

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${pregao.arquivos.map((arquivo, index) => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--input-bg); border-radius: 6px;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.5rem;">${arquivo.tipo === 'pasta' ? '📁' : '📄'}</span>
                        <div>
                            <div style="font-weight: 500;">${arquivo.nome}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${arquivo.data || ''}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="action-btn view" onclick="visualizarArquivo(${pregaoId}, ${index})">Ver</button>
                        <button class="action-btn delete" onclick="excluirArquivo(${pregaoId}, ${index})">Excluir</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

window.uploadArquivo = function(pregaoId) {
    const nome = prompt('Nome do arquivo (incluir extensão):');
    if (!nome) return;

    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;

    if (!pregao.arquivos) pregao.arquivos = [];

    pregao.arquivos.push({
        nome: nome,
        tipo: 'arquivo',
        data: new Date().toLocaleDateString('pt-BR')
    });

    renderArquivos(pregaoId);
    showMessage('Arquivo adicionado!', 'success');
};

window.criarPasta = function(pregaoId) {
    const nome = prompt('Nome da pasta:');
    if (!nome) return;

    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;

    if (!pregao.arquivos) pregao.arquivos = [];

    pregao.arquivos.push({
        nome: nome,
        tipo: 'pasta',
        data: new Date().toLocaleDateString('pt-BR')
    });

    renderArquivos(pregaoId);
    showMessage('Pasta criada!', 'success');
};

window.visualizarArquivo = function(pregaoId, index) {
    showMessage('Visualização de arquivo simulada', 'success');
};

window.excluirArquivo = function(pregaoId, index) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;

    if (confirm('Excluir este arquivo?')) {
        pregao.arquivos.splice(index, 1);
        renderArquivos(pregaoId);
        showMessage('Arquivo excluído!', 'error');
    }
};

function closeArquivosModal() {
    const modal = document.getElementById('arquivosModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(() => modal.remove(), 200);
    }
}

// ============================================
// RENDERIZAÇÃO DA TABELA
// ============================================
function renderPregoes(pregoesToRender) {
    const container = document.getElementById('pregoesContainer');
    
    if (!container) return;
    
    if (!pregoesToRender || pregoesToRender.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Nenhum pregão encontrado</div>';
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
                                        onchange="toggleStatus(${p.id})"
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
                                <button onclick="viewPregao(${p.id})" class="action-btn view">Ver</button>
                                <button onclick="editPregao(${p.id})" class="action-btn edit">Editar</button>
                                <button onclick="openArquivos(${p.id})" class="action-btn success">Arquivos</button>
                                <button onclick="deletePregao(${p.id})" class="action-btn delete">Excluir</button>
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
