// ----------------------------------------------------------------------
// 1. VARIÁVEIS GLOBAIS
// São acessíveis à partir de qualquer função JavaScript.
// ----------------------------------------------------------------------

// Procura pelo elemento com o ID "txt-nova-tarefa" no documento HTML
const txt_nova_tarefa = document.querySelector("#txt-nova-tarefa");
// Procura pelo elemento com o ID "btn-nova-tarefa" no documento HTML
const btn_nova_tarefa = document.querySelector("#btn-nova-tarefa");
// Procura pelo elemento com o ID "lista-tarefas" no documento HTML
const lista_tarefas = document.querySelector("#lista-tarefas");

// Carrega o áudio reproduzido ao "Concluir" uma tarefa
const audioConcluir = new Audio('sound/gmae.wav');
// Força o navegador a pré-carregar o áudio para evitar atrasos na reprodução
audioConcluir.preload = "auto";

// Variável global que controla a exibição da modal "Excluir tarefa"
const modalExcluir = new bootstrap.Modal(document.getElementById('exampleModal'));

// Variável global que armazena a tarefa que será excluída
let id_tarefa_excluir;

// ----------------------------------------------------------------------
// 2. FUNÇÕES DE LÓGICA
// ----------------------------------------------------------------------

function iniciaToDo() {
    // alert("Olá mundo!");
    
    // Associa função "adicionarTarefa()" ao evento de clicar no botão de "Adicionar" nova tarefa
    btn_nova_tarefa.addEventListener("click", adicionarTarefa);
    // Associa função "adicionarTarefaEnter()" ao evento de pressionar qualquer tecla
    // no campo de "Adicionar nova tarefa"
    txt_nova_tarefa.addEventListener("keypress", adicionarTarefaEnter);
    
    // Carrega as tarefas salvas no cookie do navegador Web ao carregar a página
    const arrayTarefas = obterTarefasDoNavegador();
    // Limpa os cookies de tarefas do navegador Web antes de chamar a função "adicionarTarefa()", 
    // já que a função "adicionarTarefa()" adiciona as tarefas aos cookies do navegador Web
    // e se não limpar o cookie antes de chamar a função "adicionarTarefa()", teríamos tarefas duplicadas no cookie
    salvarCookieTarefas([]);
    arrayTarefas.forEach(strTarefa => {
        adicionarTarefa(strTarefa);
    });
}

function adicionarTarefa(strTarefa) {
    // Se a tarefa recebida não for uma variável do tipo 'string' (ex.: evento de clique no botão 'Adicionar' tarefa) ou for vazia
    if (typeof strTarefa !== 'string' || strTarefa == null) {
        // Atribui como valor da variável 'strTarefa' o texto digitado na caixa de texto 'Adicionar nova tarefa'
        strTarefa = txt_nova_tarefa.value;
    }
    
    // Se a caixa de texto de "Adicionar nova tarefa" não está vazia
    // .trim() remove espaços em branco do começo e fim do valor do campo
    if (strTarefa.trim() !== "") {
        const btn_item = `
            <div>
                <button class="btn btn-success btn-sm me-2 btn-concluir" onclick="concluirTarefa(this)">Concluir</button>
                <button class="btn btn-danger btn-sm btn-excluir" onclick="obterIDTarefaExcluir(this);modalExcluir.show()">Excluir</button>
            </div>
        `;

        // Cria um novo item de lista
        const item = document.createElement("li");
        item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        // Adiciona o texto digitado na caixa de texto e os botões para concluir e excluir a tarefa.
        // "span" permite aplicar formatações em linha
        // "w-75" limita o nome da tarefa à 75% da largura da linha, deixando 25% da largura restante reservado para os botões
        // "text-truncate" corta e adiciona reticências (três pontos ...) em nomes de tarefas que excedem 75% da largura da linha
        item.innerHTML = "<span class='w-75 text-truncate'>" + strTarefa + "</span>" + btn_item;

        // Associa os eventos de arrastar e soltar ao item da lista
        const arrayTarefas = obterTarefasDoNavegador();
        item.draggable = true;
        item.dataset.index = arrayTarefas.length + 1;
        item.addEventListener("dragstart", handleDragStart);
        item.addEventListener("dragover", handleDragOver);
        item.addEventListener("drop", handleDrop);
        item.addEventListener("dragend", handleDragEnd);
        
        // Adiciona a tarefa aos cookies do navegador Web
        adicionarTarefaAoCookie(strTarefa);
        
        // Adiciona o item a lista de tarefas
        lista_tarefas.append(item);
    }
    // Limpa o campo de texto de "Adicionar nova tarefa" após adicionar a tarefa a lista
    txt_nova_tarefa.value = "";
    // Seleciona o campo "Adicionar nova tarefa" após adicionar a tarefa a lista
    txt_nova_tarefa.focus();
}

function adicionarTarefaEnter(evento) {
    // Se a tecla pressionada for igual a "Enter"
    if (evento.key == "Enter") {
        // Chama a função JavaScript "adicionarTarefa()"
        adicionarTarefa();
    }
}

function concluirTarefa(btn_concluir) {
    // Reproduz o áudio ao clicar no botão de "Concluir"
    audioConcluir.play();
    
    // Joga 50 confettis na tela
    for (let i = 0; i <= 50; i++) {
        confetti();
    }

    // Atualiza o ID da tarefa a ser excluída e 
    // passa como parâmetro o botão de "Concluir" clickado.
    obterIDTarefaExcluir(btn_concluir);

    // Chama a função JS "excluirTarefa()".
    excluirTarefa();
}

function excluirTarefa() {
    // Remove a tarefa do cookie do navegador Web
    const arrayTarefas = obterTarefasDoNavegador(); // Carrega as tarefas para um vetor à partir do cookie do navegador Web
    arrayTarefas.splice(id_tarefa_excluir, 1); // Remove 1 tarefa do vetor à partir do ID da tarefa excluída
    salvarCookieTarefas(arrayTarefas); // Atualiza o cookie do navegador Web após excluir a tarefa
    // Remove o item da lista de tarefas
    lista_tarefas.removeChild(lista_tarefas.children[id_tarefa_excluir]);
    // Fecha a modal de "Excluir tarefa"
    modalExcluir.hide();
}

function obterIDTarefaExcluir(btn) {
    // Encontra o elemento HTML "li" (item) pai mais próximo do
    // botão de "Concluir" ou "Excluir" clickado.
    // Perceba que na função JS "obterIDTarefaExcluir()", o botão clickado é 
    // recebido como parâmetro da função (btn).
    const item = btn.closest("li");
    const tarefas = Array.from(lista_tarefas.children);
    // Por exemplo, se temos 3 tarefas e excluímos a última tarefa,
    // id_tarefa_excluir será definido para "3" que é o ID da tarefa excluída.
    id_tarefa_excluir = tarefas.indexOf(item);
}

// ----------------------------------------------------------------------
// 3. COOKIES
// Adiciona funcionalidade de cookies (persistência) das tarefas adicionadas
// (mantém as tarefas adicionadas mesmo ao fechar ou atualizar a página)
// ----------------------------------------------------------------------

const CHAVE_TAREFAS_TODO = 'tarefas_todo';

function obterTarefasDoNavegador() {
    // Tenta ler o cookie do navegador
    try {
        const cookie = localStorage.getItem(CHAVE_TAREFAS_TODO);
        if (cookie) {
            // Se o cookie existir, retorna o cookie
            return JSON.parse(cookie);
        }
    } catch (e) {
        console.error("Falha ao ler o cookie do armazenamento local.");
    }
    // Retorna um vetor vazio em caso de falha
    return [];
}

function salvarCookieTarefas(arrayTarefas) {
    try {
        // Salva as tarefas em formato JSON no navegador Web
        // Você pode visualizar os itens salvos no navegador Web em:
        // Botão direito na página > Inspecionar > Application > Storage > Local storage
        localStorage.setItem(CHAVE_TAREFAS_TODO, JSON.stringify(arrayTarefas));
    } catch (e) {
        console.error("ERRO: Falha ao salvar as tarefas no navegador. Erro: ", e);
    }
}

function adicionarTarefaAoCookie(strTarefa) {
    const arrayTarefas = obterTarefasDoNavegador(); // Obtém as tarefas atuais do cookie do navegador Web em formato de vetor
    arrayTarefas.push(strTarefa); // Adiciona a tarefa recebida como parâmetro da função ao cookie do navegador Web
    salvarCookieTarefas(arrayTarefas); // Salva o cookie com a tarefa adicionada no navegador Web
}

// ----------------------------------------------------------------------
// 4. DRAG & DROP DE TAREFAS
// Permite arrastar e soltar as tarefas com o pressionar do mouse para alterar sua ordem de exibição
// ----------------------------------------------------------------------

let dragSrc = null;

function handleDragStart(e) {
    dragSrc = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.index);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter() { this.classList.add('over'); }
function handleDragLeave() { this.classList.remove('over'); }

function handleDrop(e) {
    e.stopPropagation();
    const srcIndex = Number(e.dataTransfer.getData('text/plain'));
    const target = this;
    if (dragSrc !== target) {
        // troca elementos no DOM
        const parent = target.parentNode;
        parent.insertBefore(dragSrc, target.nextSibling);
        // depois salve a nova ordem em localStorage conforme sua lógica
    }
    return false;
}

function handleDragEnd() {
    this.classList.remove('dragging');
    let arrayTarefas = []; // Cria um vetor vazio
    // Para cada tarefa, conforme sua nova ordem na lista
    Array.from(lista_tarefas.children).forEach(i => {
        i.classList.remove('over')
        arrayTarefas.push(i.querySelector("span").textContent); // Adiciona a tarefa ao vetor de tarefas
    });
    salvarCookieTarefas(arrayTarefas); // Atualiza o cookie com a nova ordem das tarefas
}

// ----------------------------------------------------------------------
// 5. ESCUTADORES DE EVENTOS E INÍCIO
// ----------------------------------------------------------------------

iniciaToDo();