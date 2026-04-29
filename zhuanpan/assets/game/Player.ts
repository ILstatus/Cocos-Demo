import { _decorator, Animation, AudioClip, AudioSource, Collider2D, Component, Contact2DType, director, Input, input, instantiate, Label, Node, Prefab, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    // 播放动画：节点.play('动画名称');
    // 暂停动画：节点.stop('动画名称');

    // AudioSource 音频组件
    // AudioClip 音频资源
    // 1、导入音频资源
    // 2、获取音频组件 节点.getComponent(AudioSource);
    // 3、指定音频资源 音频组件.clip = 音频资源;
    // 4、开始播放音频 音频组件.play();

    @property(Node) // 导入箭靶节点
    Target_Node: Node = null;
    @property(Prefab) // 导入剑的预制体
    Jian_Prefab: Prefab = null;
    @property(Node) // 导入剑的父节点
    Jian_Parent_Node: Node = null;
    @property(Node) // 导入提示节点
    Tips_Node: Node = null;
    @property(Label) // 导入提示文本组件
    Tips_Label: Label = null;
    @property(Label) // 目标数量文本节点
    Tips_Total_Label: Label = null;
    @property(Label) // 当前数量文本节点
    Tips_New_Label: Label = null;
    @property(Animation) // 当前数量文本节点
    Button_Ani: Animation = null;
    @property(AudioClip) // 导入剑击打音频文件
    Hit_Music: AudioClip = null;
    @property(AudioClip) // 导入失败音频文件
    Lose_Music: AudioClip = null;

    Jian_Node: Node = null; // 剑自身节点
    Angle = 0; // 初始旋转角度
    Angle_Speed = 80; // 初始旋转速度

    Rotate_Flag: boolean = true; // 旋转开关

    Total_Num = 20; // 目标数量
    New_Num = 0; // 当前数量

    Up_Flag: boolean = true; // 更新数量开关

    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_START, this.Touch_Start, this)
    }
    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.Touch_Start, this)
    }

    Touch_Start() { // 触摸开始执行函数
        const Jian_Node = instantiate(this.Jian_Prefab); // 生成剑节点
        Jian_Node.setParent(this.Jian_Parent_Node); // 设置剑节点的父节点
        // 监听类型（碰撞触发）Contact2DType.BEGIN_CONTACT
        Jian_Node.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.Bengin_Contact, this); // 碰撞事件监听
        tween(Jian_Node).to(0.1, { position: new Vec3(0, -86, 0) }).call(() => {
            this.Jian_Target_Rotate(Jian_Node);
            Jian_Node.getComponent(Collider2D).off(Contact2DType.BEGIN_CONTACT, this.Bengin_Contact, this); // 碰撞事件监听
        }).start(); // 剑节点移动到目标位置
    }
    Bengin_Contact() {
        this.Up_Flag = false; // 关闭更新数量开关
        this.Tips_Node_On(false);
    }
    Hit_Audio_Play() {
        const Hit_Audio_Source = this.node.getComponent(AudioSource);
        Hit_Audio_Source.clip = this.Hit_Music;
        Hit_Audio_Source.play();
    }
    Lose_Audio_Play() {
        const Lose_Audio_Source = this.node.getComponent(AudioSource);
        Lose_Audio_Source.clip = this.Lose_Music;
        Lose_Audio_Source.play();
    }
    Tips_Node_On(bool: boolean) {
        this.Rotate_Flag = false; // 关闭旋转开关
        input.off(Input.EventType.TOUCH_START, this.Touch_Start, this)
        this.Tips_Node.active = true; // 显示提示节点
        this.Button_Ani.play('btnani'); // 播放 animate 动画
        if (bool) {
            this.Tips_Label.string = '恭喜你，通过！';
        } else {
            this.Tips_Label.string = '你输了，请重新开始！';
        }
    }
    Update_Num() {
        if (!this.Up_Flag) {
            this.Lose_Audio_Play()
            return;
        }

        this.Hit_Audio_Play();
        this.New_Num++;
        this.Tips_New_Label.string = `当前：${this.New_Num}把剑`;
        if (this.New_Num >= this.Total_Num) {
            this.Tips_Node_On(true);
        }
    }
    Jian_Target_Rotate(jian_node: Node) { // 箭靶旋转函数
        // 1、获取剑自身节点世界坐标 节点.getWorldPosition()
        // 2、设置剑自身节点的父节点（箭靶） 节点.setParent(父节点)
        // 3、设置剑自身节点的世界坐标 节点.setWorldPosition(节点.getWorldPosition())
        // 4、设置剑自身节点的旋转角度为箭靶的反方向旋转值

        const World_Pos = jian_node.getWorldPosition(); // 获取剑节点世界坐标
        jian_node.setParent(this.Target_Node); // 设置剑节点的父节点（箭靶）
        jian_node.setWorldPosition(World_Pos); // 设置剑节点的世界坐标
        jian_node.angle = -this.Target_Node.angle; // 设置剑节点的旋转角度为箭靶的反方向旋转值
        this.Update_Num(); // 更新数量
    }
    start() {
        this.Tips_Total_Label.string = `目标：射入${this.Total_Num}把剑`;
        this.Tips_New_Label.string = `当前：${this.New_Num}把剑`;
    }
    Restart() {
        director.loadScene('main');
    }
    update(deltaTime: number) {
        if (!this.Rotate_Flag) return;
        if (this.Angle >= 360) this.Angle = 0; // 旋转角度超过360度时重置为0
        this.Angle += deltaTime * this.Angle_Speed; // 每帧增加旋转角度
        this.Target_Node.angle = this.Angle; // 旋转箭靶
    }
}

