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
            orgao: 'PREFEITURA MUNICIPAL DE VITÓRIA',
            uasg: '925001',
            numeroPregao: '001/2024',
            data: '2024-12-15',
            sistema: 'BANCO DO BRASIL',
            vendedor: 'ROBERTO',
            status: 'aberto',
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
    
    const btnTodos = document.createElement('button');
    btnTodos.className = `mes-button ${mesSelecionado === 'TODOS' ? 'active' : ''}`;
    btnTodos.textContent = 'TODOS';
    btnTodos.onclick = () => window.selecionarMes('TODOS');
    fragment.appendChild(btnTodos);
    
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

    if (mesSelecionado !== 'TODOS') {
        filtered = filtered.filter(p => {
            const mes = p.data.substring(5, 7);
            return mes === mesSelecionado;
        });
    }

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
            setTimeout(() => { modal.remove(); resolve(result); }, 200);
        };
        confirmBtn.addEventListener('click', () => closeModal(true));
        cancelBtn.addEventListener('click', () => closeModal(false));
    });
}

// ============================================
// FORMULÁRIO INICIAL
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

window.toggleStatus = function(id) {
    const pregao = pregoes.find(p => p.id == id);
    if (!pregao) return;
    const novoStatus = pregao.status === 'ganho' ? 'aberto' : 'ganho';
    pregao.status = novoStatus;
    filterPregoes();
    showMessage(`Pregão marcado como ${novoStatus === 'ganho' ? 'GANHO' : 'ABERTO'}!`, 'success');
};

window.editPregao = function(id) {
    const pregao = pregoes.find(p => p.id == id);
    if (!pregao) {
        showMessage('Pregão não encontrado!', 'error');
        return;
    }
    showFormModal(id);
};

window.deletePregao = async function(id) {
    const confirmed = await showConfirm('Tem certeza que deseja excluir este pregão?', {
        title: 'Excluir Pregão',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        type: 'warning'
    });
    if (!confirmed) return;
    pregoes = pregoes.filter(p => p.id != id);
    atualizarMesesDisponiveis();
    renderMesesFilter();
    filterPregoes();
    showMessage('Pregão excluído!', 'success');
};

// ============================================
// VISUALIZAÇÃO COMPLETA (CARREGAMENTO RÁPIDO)
// ============================================
let pregaoAtualVisualizacao = null;

window.viewPregao = function(id) {
    const pregao = pregoes.find(p => p.id == id);
    if (!pregao) {
        showMessage('Pregão não encontrado!', 'error');
        return;
    }
    pregaoAtualVisualizacao = pregao;
    document.getElementById('mainScreen').classList.add('hidden');
    document.getElementById('viewScreen').classList.remove('hidden');
    document.getElementById('viewScreenTitle').textContent = `Pregão Nº ${pregao.numeroPregao}`;
    renderTabGeral(pregao);
    switchViewTab(0);
};

window.voltarParaPregoes = function() {
    document.getElementById('viewScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
    pregaoAtualVisualizacao = null;
};

// ============================================
// ABA GERAL - SELECIONÁVEIS CLICÁVEIS
// ============================================
function renderTabGeral(pregao) {
    const container = document.getElementById('view-tab-geral');
    if (!container) return;
    const s = pregao.selecionaveis || {};
    container.innerHTML = `
        <div style="padding: 1rem 0;">
            <div class="form-grid">
                <div class="form-group">
                    <label>Vendedor</label>
                    <input type="text" value="${pregao.vendedor || ''}" disabled style="background: var(--bg-card);">
                </div>
                <div class="form-group">
                    <label>UASG</label>
                    <input type="text" value="${pregao.uasg || ''}" disabled style="background: var(--bg-card);">
                </div>
                <div class="form-group">
                    <label>Órgão</label>
                    <input type="text" value="${pregao.orgao || ''}" disabled style="background: var(--bg-card);">
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
                    <input type="text" value="${formatDate(pregao.data)}" disabled style="background: var(--bg-card);">
                </div>
                <div class="form-group">
                    <label>Modo de Disputa</label>
                    <input type="text" id="geral_modoDisputa" value="${pregao.modoDisputa || ''}" onchange="autoSaveGeral(${pregao.id})">
                </div>
            </div>
            <div style="margin: 2rem 0;">
                <label style="display: block; margin-bottom: 1rem; font-weight: 600;">Selecionáveis:</label>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75rem;">
                    <div class="seleccionavel ${s.certificadoIbama ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'certificadoIbama')">CERTIFICADO IBAMA/CTF</div>
                    <div class="seleccionavel ${s.registroPreco ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'registroPreco')">REGISTRO DE PREÇO</div>
                    <div class="seleccionavel ${s.instalacao ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'instalacao')">INSTALAÇÃO OU INSPEÇÃO</div>
                    <div class="seleccionavel ${s.visitaTecnica ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'visitaTecnica')">VISITA TÉCNICA</div>
                    <div class="seleccionavel ${s.amostra ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'amostra')">AMOSTRA</div>
                    <div class="seleccionavel ${s.atestado ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'atestado')">ATESTADO DE CAPACIDADE TÉCNICA</div>
                    <div class="seleccionavel ${s.cadastrarAcima ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'cadastrarAcima')">CADASTRAR ACIMA DO ESTIMADO</div>
                    <div class="seleccionavel ${s.banco ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'banco')">BANCO</div>
                    <div class="seleccionavel ${s.garantia ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'garantia')">GARANTIA DE PROPOSTA</div>
                    <div class="seleccionavel ${s.icms ? 'active' : ''}" onclick="toggleSeleccionavel(${pregao.id}, 'icms')">INFORMAÇÃO ICMS: DIFAL - EQUALIZAÇÃO</div>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Validade da Proposta</label>
                    <input type="text" id="sel_validade" value="${s.validade || ''}" onchange="autoSaveGeral(${pregao.id})">
                </div>
                <div class="form-group">
                    <label>Prazo de Entrega</label>
                    <input type="text" id="sel_prazoEntrega" value="${s.prazoEntrega || ''}" onchange="autoSaveGeral(${pregao.id})">
                </div>
                <div class="form-group">
                    <label>Prazo de Pagamento</label>
                    <input type="text" id="sel_prazoPagamento" value="${s.prazoPagamento || ''}" onchange="autoSaveGeral(${pregao.id})">
                </div>
            </div>
        </div>
    `;
}

window.toggleSeleccionavel = function(id, campo) {
    const pregao = pregoes.find(p => p.id == id);
    if (!pregao) return;
    pregao.selecionaveis[campo] = !pregao.selecionaveis[campo];
    renderTabGeral(pregao);
    showMessage('✓ Salvo', 'success');
};

window.autoSaveGeral = function(id) {
    const pregao = pregoes.find(p => p.id == id);
    if (!pregao) return;
    pregao.cidadeUf = document.getElementById('geral_cidadeUf')?.value.trim() || '';
    pregao.telefone = document.getElementById('geral_telefone')?.value.trim() || '';
    pregao.email = document.getElementById('geral_email')?.value.trim() || '';
    pregao.modoDisputa = document.getElementById('geral_modoDisputa')?.value.trim() || '';
    pregao.selecionaveis.validade = document.getElementById('sel_validade')?.value.trim() || '';
    pregao.selecionaveis.prazoEntrega = document.getElementById('sel_prazoEntrega')?.value.trim() || '';
    pregao.selecionaveis.prazoPagamento = document.getElementById('sel_prazoPagamento')?.value.trim() || '';
    showMessage('✓ Salvo', 'success');
};

// ============================================
// ABA ITENS - TABELA COM AUTO-SAVE E VENDA UNT = CUSTO x 149%
// ============================================
function renderTabItens(pregao) {
    const container = document.getElementById('view-tab-itens');
    if (!container) return;
    container.innerHTML = `
        <div style="padding: 1rem 0;">
            <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem;">
                <button type="button" class="success small" onclick="adicionarItem(${pregao.id})">+ Adicionar Item</button>
                <button type="button" class="secondary small" onclick="adicionarIntervalo(${pregao.id})">Adicionar Intervalo</button>
            </div>
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;">✓</th>
                            <th style="width: 60px;">ITEM</th>
                            <th style="min-width: 250px;">DESCRIÇÃO</th>
                            <th style="width: 80px;">QTD</th>
                            <th style="width: 80px;">UND</th>
                            <th style="width: 100px;">MARCA</th>
                            <th style="width: 100px;">MODELO</th>
                            <th style="width: 120px; background: rgba(255, 243, 205, 0.2);">EST. UNT</th>
                            <th style="width: 120px; background: rgba(255, 243, 205, 0.2);">EST. TOTAL</th>
                            <th style="width: 120px;">CUSTO UNT</th>
                            <th style="width: 120px;">CUSTO TOTAL</th>
                            <th style="width: 120px; background: rgba(255, 232, 204, 0.2);">VENDA UNT</th>
                            <th style="width: 120px;">VENDA TOTAL</th>
                            <th style="width: 80px;">AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody id="items-body-${pregao.id}"></tbody>
                </table>
            </div>
            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-card); border-radius: 8px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-weight: 600;">
                    <div>TOTAL ESTIMADO: <span id="total-estimado-${pregao.id}" style="color: #f59e0b;">R$ 0,00</span></div>
                    <div>TOTAL CUSTO: <span id="total-custo-${pregao.id}">R$ 0,00</span></div>
                    <div>TOTAL VENDA: <span id="total-venda-${pregao.id}" style="color: #22c55e;">R$ 0,00</span></div>
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
    tbody.innerHTML = pregao.itens.map((item, idx) => {
        const qtd = parseFloat(item.quantidade) || 0;
        const estUnt = parseFloat(item.estimadoUnt) || 0;
        const custoUnt = parseFloat(item.custoUnt) || 0;
        const vendaUnt = parseFloat(item.vendaUnt) || 0;
        const estTotal = estUnt * qtd;
        const custoTotal = custoUnt * qtd;
        const vendaTotal = vendaUnt * qtd;
        const excedeEstimado = vendaUnt > estUnt;
        const rowClass = item.ganho ? 'item-ganho' : (excedeEstimado ? 'excede-estimado' : '');
        return `
            <tr class="${rowClass}">
                <td style="text-align: center;">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="chk-${pregaoId}-${idx}" ${item.ganho ? 'checked' : ''} onchange="toggleItemGanho(${pregaoId}, ${idx})" class="styled-checkbox">
                        <label for="chk-${pregaoId}-${idx}" class="checkbox-label-styled"></label>
                    </div>
                </td>
                <td style="text-align: center;"><strong>${item.numero}</strong></td>
                <td><textarea rows="2" oninput="atualizarItem(${pregaoId}, ${idx}, 'descricao', this.value)" style="width:100%;padding:6px;border:1px solid var(--border-color);border-radius:4px;background:var(--input-bg);color:var(--text-primary);font-size:0.85rem;resize:vertical;font-family:inherit;">${item.descricao || ''}</textarea></td>
                <td><input type="text" value="${qtd.toFixed(2)}" oninput="atualizarNumerico(${pregaoId}, ${idx}, 'quantidade', this.value)" style="width:100%;padding:6px;text-align:right;"></td>
                <td><input type="text" value="${item.unidade || ''}" oninput="atualizarItem(${pregaoId}, ${idx}, 'unidade', this.value)" style="width:100%;padding:6px;"></td>
                <td><input type="text" value="${item.marca || ''}" oninput="atualizarItem(${pregaoId}, ${idx}, 'marca', this.value)" style="width:100%;padding:6px;"></td>
                <td><input type="text" value="${item.modelo || ''}" oninput="atualizarItem(${pregaoId}, ${idx}, 'modelo', this.value)" style="width:100%;padding:6px;"></td>
                <td style="background: rgba(255, 243, 205, 0.2);"><input type="text" value="${estUnt.toFixed(2)}" oninput="atualizarNumerico(${pregaoId}, ${idx}, 'estimadoUnt', this.value)" style="width:100%;padding:6px;text-align:right;"></td>
                <td style="background: rgba(255, 243, 205, 0.2);"><input type="text" value="R$ ${estTotal.toFixed(2)}" readonly style="width:100%;padding:6px;background:var(--bg-card);text-align:right;"></td>
                <td><input type="text" value="${custoUnt.toFixed(2)}" oninput="atualizarCustoUnt(${pregaoId}, ${idx}, this.value)" style="width:100%;padding:6px;text-align:right;"></td>
                <td><input type="text" value="R$ ${custoTotal.toFixed(2)}" readonly style="width:100%;padding:6px;background:var(--bg-card);text-align:right;"></td>
                <td style="background: rgba(255, 232, 204, 0.2);"><input type="text" value="${vendaUnt.toFixed(2)}" oninput="atualizarVendaUnt(${pregaoId}, ${idx}, this.value)" style="width:100%;padding:6px;text-align:right;"></td>
                <td><input type="text" value="R$ ${vendaTotal.toFixed(2)}" readonly style="width:100%;padding:6px;background:var(--bg-card);text-align:right;"></td>
                <td style="text-align:center;"><button class="action-btn delete" onclick="excluirItem(${pregaoId}, ${idx})">🗑</button></td>
            </tr>
        `;
    }).join('');
    recalcularTotais(pregaoId);
}

function recalcularTotais(pregaoId) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;
    let totEst = 0, totCusto = 0, totVenda = 0;
    pregao.itens.forEach(i => {
        const q = parseFloat(i.quantidade) || 0;
        totEst += (parseFloat(i.estimadoUnt) || 0) * q;
        totCusto += (parseFloat(i.custoUnt) || 0) * q;
        totVenda += (parseFloat(i.vendaUnt) || 0) * q;
    });
    const e1 = document.getElementById(`total-estimado-${pregaoId}`);
    const e2 = document.getElementById(`total-custo-${pregaoId}`);
    const e3 = document.getElementById(`total-venda-${pregaoId}`);
    if (e1) e1.textContent = `R$ ${totEst.toFixed(2)}`;
    if (e2) e2.textContent = `R$ ${totCusto.toFixed(2)}`;
    if (e3) e3.textContent = `R$ ${totVenda.toFixed(2)}`;
}

window.atualizarItem = function(pregaoId, idx, campo, valor) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao || !pregao.itens[idx]) return;
    pregao.itens[idx][campo] = valor;
};

window.atualizarNumerico = function(pregaoId, idx, campo, valor) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao || !pregao.itens[idx]) return;
    const num = parseFloat(valor.replace(',', '.')) || 0;
    pregao.itens[idx][campo] = num;
    renderizarItens(pregaoId);
};

window.atualizarCustoUnt = function(pregaoId, idx, valor) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao || !pregao.itens[idx]) return;
    const custo = parseFloat(valor.replace(',', '.')) || 0;
    pregao.itens[idx].custoUnt = custo;
    pregao.itens[idx].vendaUnt = custo * 1.49;
    renderizarItens(pregaoId);
};

window.atualizarVendaUnt = function(pregaoId, idx, valor) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao || !pregao.itens[idx]) return;
    const venda = parseFloat(valor.replace(',', '.')) || 0;
    pregao.itens[idx].vendaUnt = venda;
    renderizarItens(pregaoId);
};

window.toggleItemGanho = function(pregaoId, idx) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao || !pregao.itens[idx]) return;
    pregao.itens[idx].ganho = !pregao.itens[idx].ganho;
    renderizarItens(pregaoId);
};

window.adicionarItem = function(pregaoId) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;
    const novoNum = pregao.itens.length > 0 ? Math.max(...pregao.itens.map(i => i.numero)) + 1 : 1;
    pregao.itens.push({
        numero: novoNum,
        descricao: '',
        quantidade: 1,
        unidade: 'UN',
        marca: '',
        modelo: '',
        estimadoUnt: 0,
        custoUnt: 0,
        vendaUnt: 0,
        ganho: false
    });
    renderizarItens(pregaoId);
    showMessage('✓ Item adicionado', 'success');
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
            for (let i = inicio; i <= fim; i++) numeros.push(i);
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
                ganho: false
            });
        }
    });
    pregao.itens.sort((a, b) => a.numero - b.numero);
    renderizarItens(pregaoId);
    showMessage(`✓ ${numeros.length} itens adicionados`, 'success');
};

window.excluirItem = function(pregaoId, idx) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;
    if (confirm('Excluir este item?')) {
        pregao.itens.splice(idx, 1);
        renderizarItens(pregaoId);
        showMessage('✓ Item excluído', 'error');
    }
};

function renderTabProposta(pregao) {
    const container = document.getElementById('view-tab-proposta');
    if (!container) return;
    container.innerHTML = `<div style="padding: 1rem 0;"><p style="color: var(--text-secondary);">Funcionalidade em desenvolvimento...</p></div>`;
}

function renderTabComprovante(pregao) {
    const container = document.getElementById('view-tab-comprovante');
    if (!container) return;
    container.innerHTML = `<div style="padding: 1rem 0;"><p style="color: var(--text-secondary);">Funcionalidade em desenvolvimento...</p></div>`;
}

window.switchViewTab = function(index) {
    document.querySelectorAll('#viewScreen .tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    document.querySelectorAll('#viewScreen .tab-content').forEach((content, i) => {
        content.classList.toggle('active', i === index);
    });
    if (!pregaoAtualVisualizacao) return;
    if (index === 1 && !document.getElementById(`items-body-${pregaoAtualVisualizacao.id}`)?.children.length) {
        renderTabItens(pregaoAtualVisualizacao);
    } else if (index === 2) {
        renderTabProposta(pregaoAtualVisualizacao);
    } else if (index === 3) {
        renderTabComprovante(pregaoAtualVisualizacao);
    }
};

// ============================================
// BOTÃO ARQUIVOS
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
                            📁 ${pregao.vendedor}-${pregao.data}-${pregao.uasg}-${pregao.numeroPregao}/
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
    showMessage('✓ Arquivo adicionado', 'success');
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
    showMessage('✓ Pasta criada', 'success');
};

window.visualizarArquivo = function() {
    showMessage('Visualização simulada', 'success');
};

window.excluirArquivo = function(pregaoId, index) {
    const pregao = pregoes.find(p => p.id == pregaoId);
    if (!pregao) return;
    if (confirm('Excluir este arquivo?')) {
        pregao.arquivos.splice(index, 1);
        renderArquivos(pregaoId);
        showMessage('✓ Arquivo excluído', 'error');
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
                                    <input type="checkbox" id="check-${p.id}" ${p.status === 'ganho' ? 'checked' : ''} onchange="toggleStatus(${p.id})" class="styled-checkbox">
                                    <label for="check-${p.id}" class="checkbox-label-styled"></label>
                                </div>
                            </td>
                            <td><strong>${p.uasg || 'N/A'}</strong></td>
                            <td><strong>${p.numeroPregao}</strong></td>
                            <td>${formatDate(p.data)}</td>
                            <td>${p.vendedor || 'N/A'}</td>
                            <td><span class="badge ${p.status}">${p.status.toUpperCase()}</span></td>
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
    }, 2000);
}
