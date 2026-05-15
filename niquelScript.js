

    const symbols = ["🍒","🍋","🍉","⭐","💎","🔔"]

    function randomSymbol(){
    return symbols[Math.floor(Math.random()*symbols.length)]
}

    function spin(){

    document.getElementById("result").textContent=""

    let spin1 = setInterval(()=>{document.getElementById("s1").textContent=randomSymbol()},100)
    let spin2 = setInterval(()=>{document.getElementById("s2").textContent=randomSymbol()},100)
    let spin3 = setInterval(()=>{document.getElementById("s3").textContent=randomSymbol()},100)

    setTimeout(()=>{clearInterval(spin1)},1000)
    setTimeout(()=>{clearInterval(spin2)},1500)
    setTimeout(()=>{clearInterval(spin3)

    checkWin()

},2000)

}

    function checkWin(){

    let r1 = document.getElementById("s1").textContent
    let r2 = document.getElementById("s2").textContent
    let r3 = document.getElementById("s3").textContent

    if(r1===r2 && r2===r3){
    document.getElementById("result").textContent="🎉 JACKPOT!"
}else{
    document.getElementById("result").textContent="Tente novamente"
}

}

