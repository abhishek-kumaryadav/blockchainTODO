App = {
    loading: false,

    // Empty contracts variable
    contracts: {},
  
    load: async () => {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.render()
    },
  
    // Loading the web3.js in our page
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
    },
    
    // Selects the first account of the ganache-cli
    loadAccount: async () => {
      // Set the current blockchain account
      App.account = web3.eth.accounts[0]
    //   console.log(App.account)
    },
  
    // Loading the smartContract in our page
    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const todoList = await $.getJSON('TodoList.json')

      // TruffleContract is a javaScript representation of our contract allowing us to use functions from it
      App.contracts.TodoList = TruffleContract(todoList)
      App.contracts.TodoList.setProvider(App.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      App.todoList = await App.contracts.TodoList.deployed()
    },
  
    render: async () => {
      // Prevent double render
      if (App.loading) {
        return 
      }
  
      // Update app loading state
      App.setLoading(true)
  
      // Render accountNumber in navBar
      $('#account').html(App.account)
  
      // Render Tasks
      await App.renderTasks()
  
      // Update loading state
      App.setLoading(false)
    },
  
    renderTasks: async () => {
      // Load the total task count from the blockchain
      const taskCount = await App.todoList.taskCount()
      const $taskTemplate = $('.taskTemplate')  // Fetches the template from html that we will fill
  
      // Render out each task with a new task template(checkBox, content)
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.tasks(i)
        const taskId = task[0].toNumber()
        const taskContent = task[1]
        const taskCompleted = task[2]
  
        // Create the html for the task
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.content').html(taskContent)
        $newTaskTemplate.find('input')
                        .prop('name', taskId)
                        .prop('checked', taskCompleted)
                        // .on('click', App.toggleCompleted)
  
        // Put the task in the correct list
        if (taskCompleted) {
          $('#completedTaskList').append($newTaskTemplate)
        } else {
          $('#taskList').append($newTaskTemplate)
        }
  
        // Show the task
        $newTaskTemplate.show()
      }
    },
  
    createTask: async () => {
      App.setLoading(true)
      // Getting input value from form
      const content = $('#newTask').val()
      // js -> truffle contract -> contract in server
      await App.todoList.createTask(content)
      // reloading the page
      window.location.reload()
    },
  
    toggleCompleted: async (e) => {
      App.setLoading(true)
      const taskId = e.target.name
      await App.todoList.toggleCompleted(taskId)
      window.location.reload()
    },
    
    // Updating loading and switch between loader and content
    setLoading: (boolean) => {
      App.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    }
  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })