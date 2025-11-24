function validateForm(form) {
  let isValid = true;
  let firstInvalidField = null;

  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    if (field.value.trim() === "") {
      isValid = false;
      field.style.border = "2px solid red";
      if (!firstInvalidField) {
        firstInvalidField = field;
      }
    } else {
      field.style.border = "";
    }
  });

  if (!isValid) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    if (firstInvalidField) {
      firstInvalidField.focus();
    }
    return false;
  }

  return true;
}

const estadosCidades = {
  MG: [
    "Belo Horizonte",
    "Uberlândia",
    "Contagem",
    "Juiz de Fora",
    "Betim",
    "Poços de Caldas",
  ],
  SP: [
    "São Paulo",
    "Campinas",
    "Santos",
    "Ribeirão Preto",
    "Osasco",
    "Guarulhos",
  ],
  RJ: [
    "Rio de Janeiro",
    "Niterói",
    "São Gonçalo",
    "Duque de Caxias",
    "Nova Iguaçu",
    "Cabo Frio",
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const estadoSelect = document.getElementById("estado");

  if (estadoSelect) {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Selecione um Estado";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    estadoSelect.appendChild(defaultOption);

    for (const estado in estadosCidades) {
      const option = document.createElement("option");
      option.value = estado;
      option.textContent = estado;
      estadoSelect.appendChild(option);
    }
  }

  if (document.getElementById("vendasForm")) {
    calculateTotal();
  }
});

function updateCidades() {
  const estadoSelect = document.getElementById("estado");
  const cidadeSelect = document.getElementById("cidade");
  const estado = estadoSelect.value;

  cidadeSelect.innerHTML = '<option value="">Selecione uma Cidade</option>';
  cidadeSelect.disabled = true;
  cidadeSelect.value = "";

  if (estado && estadosCidades[estado]) {
    estadosCidades[estado].forEach((cidade) => {
      const option = document.createElement("option");
      option.value = cidade;
      option.textContent = cidade;
      cidadeSelect.appendChild(option);
    });
    cidadeSelect.disabled = false;
  }
}

function validateClienteForm(form) {
  const nomeInput = document.getElementById("nome");
  const dataNascimentoInput = document.getElementById("dataNascimento");
  const cpfInput = document.getElementById("cpf");
  const telefoneInput = document.getElementById("telefone");
  const emailInput = document.getElementById("email");
  const estadoSelect = document.getElementById("estado");
  const cidadeSelect = document.getElementById("cidade");

  let isValid = true;
  let errorMessage = "";

  const inputs = [
    nomeInput,
    dataNascimentoInput,
    cpfInput,
    telefoneInput,
    emailInput,
    estadoSelect,
    cidadeSelect,
  ];
  inputs.forEach((input) => {
    if (input) input.style.border = "";
  });

  const addError = (input, msg) => {
    errorMessage += `- ${msg}\n`;
    isValid = false;
    if (input) input.style.border = "2px solid red";
  };

  const nome = nomeInput.value.trim();
  if (nome.split(/\s+/).filter((word) => word.length > 0).length < 2) {
    addError(
      nomeInput,
      "O nome deve conter pelo menos duas palavras (nome e sobrenome)."
    );
  }

  const dataNasc = new Date(dataNascimentoInput.value);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (dataNascimentoInput.value === "" || dataNasc >= hoje) {
    addError(
      dataNascimentoInput,
      "A data de nascimento deve ser anterior à data atual."
    );
  }

  const cpf = cpfInput.value.trim();
  const numStr = cpf.replace(/\D/g, "");
  if (numStr.length >= 2) {
    const checkDigits = numStr.slice(-2);
    const sumDigits = numStr
      .slice(0, -2)
      .split("")
      .reduce((sum, digit) => sum + parseInt(digit), 0);

    if (sumDigits.toString() !== checkDigits) {
      addError(
        cpfInput,
        `Validação CPF/CNPJ: A soma dos dígitos iniciais (${sumDigits}) não é igual aos dois últimos dígitos (${checkDigits}).`
      );
    }
  } else if (cpf !== "") {
    addError(cpfInput, "CPF/CNPJ incompleto. Verifique o número.");
  }

  const telefone = telefoneInput.value.trim();
  const phoneRegex = /^\d{5}-?\d{4}$/;
  if (!phoneRegex.test(telefone)) {
    addError(
      telefoneInput,
      "O telefone deve ter 9 dígitos (ex: 987458855 ou 98745-8855)."
    );
  }

  const email = emailInput.value.trim();
  const emailRegex = /@.+\./;
  if (!emailRegex.test(email)) {
    addError(emailInput, 'O email deve possuir "@" e um ponto "." após o "@".');
  }

  if (estadoSelect && estadoSelect.value === "") {
    addError(estadoSelect, "Selecione o Estado.");
  }
  if (cidadeSelect && cidadeSelect.value === "") {
    addError(cidadeSelect, "Selecione a Cidade.");
  }

  if (!isValid) {
    alert("Erros de validação no Cadastro de Cliente:\n" + errorMessage);
    return false;
  }
  return validateForm(form);
}

let itemCounter = 1;

function addItem() {
  itemCounter++;
  const container = document.getElementById("itensContainer");
  const newItemDiv = document.createElement("div");
  newItemDiv.classList.add("itemVenda");
  newItemDiv.innerHTML = `
        <label for="livro_${itemCounter}"><b>Livro:</b></label>
        <input type="text" id="livro_${itemCounter}" name="livro[]" required /><br />
        <label for="quantidade_${itemCounter}"><b>Quantidade:</b></label>
        <input type="number" id="quantidade_${itemCounter}" name="quantidade[]" min="1" value="1" onchange="calculateTotal()" required /><br />
        <label for="preco_${itemCounter}"><b>Preço Unitário:</b></label>
        <input type="number" id="preco_${itemCounter}" name="preco[]" step="0.01" min="0.01" value="0.00" onchange="calculateTotal()" required /><br /><br />
        <button type="button" onclick="removeItem(this)">Remover Item</button><br><br>
    `;

  container.appendChild(newItemDiv);
  calculateTotal();
}

function removeItem(button) {
  const itemDiv = button.parentNode;
  itemDiv.remove();
  calculateTotal();
}

function calculateTotal() {
  let total = 0;
  const quantities = document.querySelectorAll('[name="quantidade[]"]');
  const prices = document.querySelectorAll('[name="preco[]"]');

  quantities.forEach((qtyInput, index) => {
    if (prices[index]) {
      const qty = parseFloat(qtyInput.value) || 0;
      const price = parseFloat(prices[index].value) || 0;
      total += qty * price;
    }
  });

  document.getElementById("total").value = total.toFixed(2);
}
function validateVendasForm(form) {
  const itensContainer = document.getElementById("itensContainer");
  const itemElements = itensContainer.querySelectorAll(".itemVenda");

  if (itemElements.length === 0) {
    alert("É obrigatório adicionar pelo menos um item à venda.");
    return false;
  }

  const totalInput = document.getElementById("total");
  const total = parseFloat(totalInput.value);
  if (total <= 0) {
    alert(
      "O valor total da venda deve ser maior que zero. Verifique as quantidades e preços dos itens."
    );
    totalInput.style.border = "2px solid red";
    return false;
  }
  totalInput.style.border = "";
  return validateForm(form);
}
