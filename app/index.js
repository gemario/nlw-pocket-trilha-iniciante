const { select, input, checkbox} = require('@inquirer/prompts') 
const fs = require("fs").promises
let mensagem = "Bem vindo ao App de Metas"

let metas 

async function carregarMetas() {
  try {
    const data = await fs.readFile("metas.json", "utf-8")
    metas = JSON.parse(data)
  }
  catch(erro) {
    metas = []
  }
}

async function salvarMetas() {
  await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}

async function cadastrarMeta() {
  const meta = await input({message: "Digite a meta:"})

  if(meta.length == 0) {
    mensagem = "A meta não pode ser vazia."
    return
  }

  metas.push({value: meta, checked: false})

  mensagem = "Meta cadastrada com sucesso!"
}

async function listarMetas() {
  if(metas.length == 0 ) {
    mensagem = "Não existem metas! :("
    return
  }
  const respostas = await checkbox({
    message: "Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o Enter para finalizar essa etapa",
    choices: [...metas],
    instructions: false
  })

  metas.forEach((m) => {
    m.checked = false
  })

  if(respostas.length == 0) {
    mensagem = "Nenhuma meta selecionada!"
    return
  }

  respostas.forEach((resposta) => {
    const meta = metas.find((m) => {
      return m.value == resposta
    })
    meta.checked = true
  })
  mensagem = "Meta(s) marcada(s) como concluida(s)"
}

async function metasRealizadas() {
  if(metas.length == 0 ) {
    mensagem = "Não existem metas! :("
    return
  }
  const realizadas = metas.filter((meta) => {
    return meta.checked
  })
  if(realizadas.length == 0) {
    mensagem = "Não existem metas realizadas! :("
    return
  }
  await select({
    message: "Metas realizadas: " + realizadas.length,
    choices: [...realizadas]
  })
}

async function metasAbertas() {
  if(metas.length == 0 ) {
    mensagem = "Não existem metas! :("
    return
  }
  const abertas = metas.filter((meta) => {
    return meta.checked != true
  })
  if(abertas.length == 0) {
    mensagem = "Não existem metas abertas! :)"
    return
  }
  await select({
    message: "Metas abertas: " + abertas.length,
    choices: [...abertas]
  })
}

async function deletarMetas() {
  if(metas.length == 0 ) {
    mensagem = "Não existem metas! :("
    return
  }
  const metasDesmarcadas = metas.map((meta) => {
    return {value: meta.value, checked: false}
  })
  const metasADeletar = await checkbox({
    message: "Selecione a meta que deseja deletar!",
    choices: [...metasDesmarcadas],
    instructions: false
  })
  if(metasADeletar.length == 0 ) {
    mensagem = "Nenhuma meta para deletar!"
    return
  }
  metasADeletar.forEach((item) => {
    metas = metas.filter((meta) => {
      return meta.value != item
    })
  })
  mensagem = "Meta(s) deletada(s) com sucesso! :)"
}

function mostrarMenssagem() {
  console.clear()

  if(mensagem != "") {
    console.log(mensagem)
    console.log("")
    mensagem = ""
  }
}

async function start() {
  await carregarMetas()

  while(true) {

    mostrarMenssagem()
    await salvarMetas()

    const opcao = await select({
      message: "Menu >",
      choices: [
        {
          name: "Cadastrar metas",
          value: "cadastrar"
        },
        {
          name: "Listar metas",
          value: "listar"
        },
        {
          name: "Metas realizadas",
          value: "realizadas"
        },
        {
          name: "Metas abertas",
          value: "abertas"
        },
        {
          name: "Deletar metas",
          value: "deletar"
        },
        {
          name: "Sair",
          value: "sair"
        },
      ]
    }) 

    switch(opcao) {
      case "cadastrar":
        await cadastrarMeta()
        break
      case  "listar":
        await listarMetas()
        break
      case "realizadas":
        await metasRealizadas()
        break
      case "abertas":
        await metasAbertas()
        break  
      case "deletar":
        await deletarMetas()
        break
      case "sair":
        console.log("Até a próxima!")
        return   
    }
  }
}

start()