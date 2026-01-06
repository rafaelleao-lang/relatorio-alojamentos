$(document).ready(function () {

    let pdfGerado = false;

    // =====================================================
    // CONTADOR DE CARACTERES (APENAS TELA)
    // =====================================================
    $('.observacoes-textarea').on('input', function () {

        let texto = $(this).val();

        if (texto.length > 255) {
            texto = texto.substring(0, 255);
            $(this).val(texto);
        }

        $(this)
            .closest('.container')
            .find('.caracteres-limit span')
            .text(texto.length);
    });

    // =====================================================
    // PREVIEW DE IMAGENS (FUNCIONA TELA + PDF)
    // =====================================================
    $('.input-image').on('change', function () {

        const files = Array.from(this.files);
        if (!files.length) return;

        const portraits = $(this)
            .closest('.question')
            .find('.portraits');

        files.forEach(file => {

            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();

            reader.onload = e => {

                const wrapper = $('<div>', {
                    class: 'photo-wrapper'
                });

                const img = $('<img>', {
                    src: e.target.result
                });

                const btnRemove = $('<button>', {
                    type: 'button',
                    class: 'btn-remove-photo',
                    text: '✖'
                });

                btnRemove.on('click', function () {
                    wrapper.remove();
                });

                wrapper.append(btnRemove, img);
                portraits.append(wrapper);
            };

            reader.readAsDataURL(file);
        });

        // limpa input para permitir nova seleção
        this.value = '';
    });

    // =====================================================
    // BOTÃO GERAR PDF
    // =====================================================
    $('.btn-submit').on('click', function (e) {
        e.preventDefault();

        if (pdfGerado) return;
        pdfGerado = true;

        prepararParaPDF();

        setTimeout(() => {
            gerarPDF();
        }, 1200);
    });

});


// =====================================================
// PREPARAÇÃO PARA PDF
// =====================================================
function prepararParaPDF() {

    // ativa modo PDF
    document.querySelector('.content').classList.add('modo-pdf');

    // =====================================================
    // DADOS DO CABEÇALHO
    // =====================================================
    copiarCampo('#nome-obra', '.pdf-nome-obra');
    copiarCampo('#endereco-alojamento', '.pdf-endereco');
    copiarCampo('#empresa-alojamento', '.pdf-empresa');
    copiarCampo('#responsavel-compra', '.pdf-resp-compra');
    copiarCampo('#responsavel-alojamento', '.pdf-resp-alojamento');
    copiarCampo('#responsavel-relatorio', '.pdf-responsavel-relatorio');

    const data = $('#data').val();
    if (data) {
        $('.pdf-data')
            .text(data.split('-').reverse().join('/'))
            .removeClass('d-none');
    }

    // =====================================================
    // QUESTÕES
    // =====================================================
    $('[id^="question-"]').each(function () {

        const container = $(this);

        // ============================
        // STATUS CONFORME / NÃO
        // ============================
        const conforme = container.find('input.conforme:checked').length > 0;

        const statusDiv = $('<div>', {
            class: 'pdf-status ' + (conforme ? 'ok' : 'nok'),
            text: conforme ? '✔ Conforme' : '✖ Não Conforme'
        });

        container.find('h2').after(statusDiv);

        // ============================
        // OBSERVAÇÕES
        // ============================
        const textarea = container.find('.observacoes-textarea');
        const textoObs = textarea.val()?.trim();

        if (textoObs) {
            $('<div class="pdf-observacoes"></div>')
                .text(textoObs)
                .insertAfter(textarea);
        }
    });
}


// =====================================================
// GERAR PDF
// =====================================================
function gerarPDF() {

    const content = document.querySelector('.content');

    html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: 'Relatorio_Alojamentos.pdf',
        image: {
            type: 'jpeg',
            quality: 0.98
        },
        html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        },
        pagebreak: {
            mode: ['css']
        }
    }).from(content).save();
}


// =====================================================
// FUNÇÃO AUXILIAR – COPIAR CAMPOS PARA PDF
// =====================================================
function copiarCampo(inputSelector, pdfSelector) {

    const valor = $(inputSelector).val();

    if (valor) {
        $(pdfSelector).text(valor).removeClass('d-none');
    }
}