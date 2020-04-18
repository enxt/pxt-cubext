function comenzar() {
    andar = true
    step = 0
}
function reproducirTonoPulsacion() {
    music.playTone(262, music.beat(BeatFraction.Whole))
}
function determinaAccion(stp: number) {
    if (pulsaciones[stp] == "izquierda") {
        v1 = -10
        v2 = 10
        time = 1000
        flecha = ArrowNames.West
    } else if (pulsaciones[stp] == "derecha") {
        v1 = 10
        v2 = -10
        time = 1000
        flecha = ArrowNames.East
    } else if (pulsaciones[stp] == "arriba") {
        v1 = 10
        v2 = 10
        time = 1000
        flecha = ArrowNames.North
    } else if (pulsaciones[stp] == "abajo") {
        v1 = -10
        v2 = -10
        time = 1000
        flecha = ArrowNames.South
    }
}
function determinaBoton(rango: number, isrunning: boolean) {
    if (isrunning == false) {
        if (rango >= 645 && rango <= 656) {
            pulsaciones.push("arriba")
            basic.showArrow(ArrowNames.North)
            reproducirTonoPulsacion()
            basic.clearScreen()
        } else if (rango >= 519 && rango <= 530) {
            pulsaciones = []
            basic.showIcon(IconNames.No)
            reproducirTonoPulsacion()
        } else if (rango >= 664 && rango <= 675) {
            pulsaciones.push("izquierda")
            basic.showArrow(ArrowNames.West)
            reproducirTonoPulsacion()
            basic.clearScreen()
        } else if (rango >= 390 && rango <= 401) {
            pulsaciones.push("derecha")
            basic.showArrow(ArrowNames.East)
            reproducirTonoPulsacion()
            basic.clearScreen()
        } else if (rango >= 620 && rango <= 631) {
            reproducirTonoPulsacion()
            comenzar()
        } else if (rango >= 582 && rango <= 595) {
            pulsaciones.push("abajo")
            basic.showArrow(ArrowNames.South)
            reproducirTonoPulsacion()
            basic.clearScreen()
        }
    } else {
        if (rango >= 675 && rango <= 690) {
            pausarTodo()
            reproducirTonoPulsacion()
        }
    }
}
function pausarTodo() {
    andar = false
}
function camina() {
    determinaAccion(step)
    basic.showArrow(flecha)
    myrobit.MotorRunDual(myrobit.Motors.M1, v1, myrobit.Motors.M4, v2)
    basic.pause(1000)
    myrobit.MotorStopAll()
    basic.clearScreen()
    basic.pause(500)
}
let pulsaciones: string[] = []
let step = 0
let andar = false
let flecha = 0
let time = 0
let v2 = 0
let v1 = 0
basic.showIcon(IconNames.No)
//music.beginMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once)
let pulsado = pins.analogReadPin(AnalogPin.P2)
time = 10000
flecha = -1
radio.setGroup(88)
basic.forever(function () {
    if (andar == false) {
        pulsado = pins.analogReadPin(AnalogPin.P2)
        determinaBoton(pulsado, andar)
        serial.writeNumber(pulsado)
        radio.sendNumber(pulsado)
        serial.writeLine("")
    } else {
        pulsado = pins.analogReadPin(AnalogPin.P2)
        determinaBoton(pulsado, andar)
        if (andar == true && step < pulsaciones.length) {
            camina()
            step += 1
        } else if (step == pulsaciones.length) {
            step = 0
            andar = false
            music.beginMelody(music.builtInMelody(Melodies.PowerDown), MelodyOptions.Once)
        }
    }
})
