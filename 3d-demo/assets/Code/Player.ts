import { _decorator, Component, Input, input, Node, EventKeyboard, KeyCode, Collider, ITriggerEvent, Label, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    // 重新开始方式1
    // 1、隐藏提示框节点
    // 2、初始化赛车位置
    // 3、初始化相机位置
    // 4、开启移动开关
    // 重新开始方式2
    // 通过加载场景/切换场景实现
    // 语句：director.loadScene('场景名称'); // 需要导包


    // 控制文本组件，修改文本内容
    // 修改文本内容语句：文本组件.string = '文本内容';
    @property(Label)
    Tips_Label: Label = null;

    @property(Node)
    Tips_Node: Node = null; // 导入提示节点
    // 脚本中绑定节点/组件：@property(类型)对象名: 类型 = null
    @property(Node)
    Camera_Node: Node = null; // 导入相机节点

    @property(Collider) // 导入节点自身碰撞组件类型（适用于只需要引用一个组件）
    Player_Node: Collider = null; // 导入赛车自身节点


    @property // 可以使该变量在编辑器中显示
    Player_Speed: number = 1; // 角色速度
    Player_Move: { [key: string]: boolean } = {
        a: false,
        d: false,
        // w: false,
        // s: false
    };
    Move_Flag: boolean = true; // 赛车移动开关

    protected onLoad(): void {
        input.on(Input.EventType.KEY_DOWN, this.Key_Down, this)
        input.on(Input.EventType.KEY_UP, this.Key_Up, this)
        this.Player_Node.on('onTriggerEnter', this.onStartCollider, this);
    }
    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.Key_Down, this)
        input.off(Input.EventType.KEY_UP, this.Key_Up, this)
        this.Player_Node.off('onTriggerEnter', this.onStartCollider, this);
    }
    Key_Down(event: EventKeyboard) {
        console.log(event.keyCode);
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                console.log('Press a key');
                this.Player_Move.a = true;
                break;
            case KeyCode.KEY_D:
                console.log('Press d key');
                this.Player_Move.d = true;
                break;
            case KeyCode.KEY_W:
                console.log('Press w key');
                this.Player_Move.w = true;
                break;
            case KeyCode.KEY_S:
                console.log('Press s key');
                this.Player_Move.s = true; 
                break;
        }
    }
    Key_Up(event: EventKeyboard) {
        console.log(event.keyCode);
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                console.log('Release a key');
                this.Player_Move.a = false;
                break;
            case KeyCode.KEY_D:
                console.log('Release d key');
                this.Player_Move.d = false;
                break;
            case KeyCode.KEY_W:
                console.log('Release w key');
                this.Player_Move.w = false;
                break;
            case KeyCode.KEY_S:
                console.log('Release s key');
                this.Player_Move.s = false;
                break;
        }
    }
    // 重新开始
    Reset_Game() {
        // 重置方式二
        director.loadScene('scene1'); // 加载/切换 场景
        // 重置方式一
        // this.Tips_Node.active = false; // 隐藏提示节点
        // this.node.setPosition(0, 0, -5); // 初始化赛车位置
        // this.Camera_Node.setPosition(0, 11.948, 17.948); // 初始化相机位置
        // this.Move_Flag = true; // 开启移动开关
    }
    onStartCollider(event: ITriggerEvent) {
        this.Move_Flag = false; // 关闭移动开关
        this.Tips_Node.active = true; // 显示提示节点
        if (event.otherCollider.node.name === 'Win') {
            this.Tips_Label.string = '恭喜你，通过！';
            console.log('You Win');
        } else {
            this.Tips_Label.string = '失败了，重新来过';
            console.log('You Lose');
        }
    }
    start() {

    }

    update(deltaTime: number) {
        const pl = this.node.getPosition(); // 获取角色节点位置
        // deltaTime 每帧的时间
        const cam_pos = this.Camera_Node.getPosition(); // 获取相机节点位置
        const time_compensator = deltaTime * this.Player_Speed

        if (!this.Move_Flag) {
            return;
        }

        // 固定位置
        // if (pl.z <= -196) {
        //     this.Move_Flag = false;
        //     console.log('到了');
        // }

        if (this.Player_Move.a && !this.Player_Move.d) {
            pl.x -= time_compensator;
        } else if (this.Player_Move.d && !this.Player_Move.a) {
            pl.x += time_compensator;
        }
        // 边界设置，[-2.6, 2.6]区间，根据场景大小调整
        // if (pl.x >= 2.6) {
        //     pl.x = 2.6;
        // } else if (pl.x <= -2.6) {
        //     pl.x = -2.6;
        // }
        // 使用Math.min和Math.max来简写
        pl.x = Math.max(-2.6, Math.min(pl.x, 2.6)); // 限制角色在x轴范围内移动
        // 由于个别设备帧率忽高忽低，会造成速度不对等，防止这种情况，需要帧时间补偿。
        this.node.setPosition(pl.x, pl.y, pl.z - time_compensator);
        this.Camera_Node.setPosition(cam_pos.x, cam_pos.y, cam_pos.z - time_compensator);
    }
}

