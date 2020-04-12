namespace myrobit {
    const LED0_ON_L = 0x06
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    let initialized = false
    export enum Motors {
        //% block="M1"
        M1 = 0x1,
        //% block="M2"
        M2 = 0x2,
        //% block="M3"
        M3 = 0x3,
        //% block="M4"
        M4 = 0x4
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5)
        buf[0] = LED0_ON_L + 4 * channel
        buf[1] = on & 0xff
        buf[2] = (on >> 8) & 0xff
        buf[3] = off & 0xff
        buf[4] = (off >> 8) & 0xff
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf)
    }
    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }
    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE)
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE)
        return val
    }
    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000
        prescaleval /= 4096
        prescaleval /= freq
        prescaleval = prescaleval * 25 / 24  // 0.915
        prescaleval -= 1
        let prescale = prescaleval //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADDRESS, MODE1)
        let newmode = (oldmode & 0x7F) | 0x10 // sleep
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode) // go to sleep
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale) // set the prescaler
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode)
        basic.pause(1)
        //control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1)  //1010 0001
    }
    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50); //1s / 20ms
        for (let idx = 0; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        initialized = true
    }
    function stopMotor(index: number) {
        setPwm((index - 1) * 2, 0, 0)
        setPwm((index - 1) * 2 + 1, 0, 0)
    }

//////////////////////////////////////////////////////

    //% blockId=robit_motor_run block="%index |Wheel|speed %speed "
    //% weight=85
    //% speed.min=-100 speed.max=100
    //% advanced=true
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function MotorRun(index: Motors, speed: number): void {
        if (!initialized) {
            initPCA9685()
        }
        speed = speed * 40; // map 100 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }
        if (index > 4 || index <= 0)
            return
        let pp = (index - 1) * 2
        let pn = (index - 1) * 2 + 1
        if (speed >= 0) {
            setPwm(pp, 0, speed)
            setPwm(pn, 0, 0)
        } else {
            setPwm(pp, 0, 0)
            setPwm(pn, 0, -speed)
        }
    }

    /**
	 * Execute two motors at the same time
     * @param motor_left describe parameter here, eg: 1
	 * @param speed1 [-100-100] speed of motor; eg: 50
	 * @param motor_right describe parameter here, eg: 2
	 * @param speed2 [-100-100] speed of motor; eg: 50
	*/
    //% blockId=robit_motor_dual block="Left wheel %motor1|speed %speed1|Right wheel %motor2|speed %speed2"
    //% weight=84
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
    export function MotorRunDual(motor_left: Motors, speed1: number, motor_right: Motors, speed2: number): void {
        speed1 = -speed1

        MotorRun(motor_left, speed1 / 2 * 5);   //100 map to 255
        MotorRun(motor_right, speed2 / 2 * 5);
    }

    //% blockId=robit_stop block="Motor Stop|%index|"
    //% weight=80
    export function MotorStop(index: Motors): void {
        MotorRun(index, 0);
    }

    //% blockId=robit_stop_all block="Motor Stop All"
    //% weight=79
    //% blockGap=50
    export function MotorStopAll(): void {
        for (let idx = 1; idx <= 4; idx++) {
            stopMotor(idx);
        }
    }
}
