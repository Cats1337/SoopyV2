import Cosmetic from "./cosmetic";

const ModelDragon = Java.type("net.minecraft.client.model.ModelDragon")
const ResourceLocation = Java.type("net.minecraft.util.ResourceLocation")

const GlStateManager = Java.type("net.minecraft.client.renderer.GlStateManager");

const FACING = Java.type("net.minecraft.block.BlockDirectional").field_176387_N
let dragon = new ModelDragon(0) //too lazy to make my own model so i just yoink it from modelDragon lmfao
let textures = new ResourceLocation("textures/entity/enderdragon/dragon.png")
let wing = getField(dragon, "field_78225_k")
let wingTip = getField(dragon, "field_78222_l")

class DragonWings extends Cosmetic {
    constructor(player, parent) {
        super(player, parent);

        this.settings = this.parent.getPlayerCosmeticSettings(this.player, "dragon_wings")

        this.animOffset = Math.random()*20*Math.PI
        this.lastRender = Date.now()

        this.lastFlapSound = this.animOffset
    }
    onRender(ticks){

        if(this.settings.disableWithNoChestplate && this.player.getPlayer().func_82169_q(2) === null && !(this.player === Player && Client.getMinecraft().field_71474_y.field_74320_O === 0)){
            return
        }

        if(this.player.getPlayer().func_98034_c(Player.getPlayer())){
            return
        }

        if(!this.parent.firstPersonVisable.getValue() && this.player === Player && Client.getMinecraft().field_71474_y.field_74320_O === 0){
            return
        }

        // return;
        // wing.func_78785_a(1)

        let timeSince = (Date.now()-this.lastRender)/1000
        this.lastRender = Date.now()

        let rotation = this.player.getPlayer().field_70761_aq+(this.player.getPlayer().field_70761_aq-this.player.getPlayer().field_70760_ar)*ticks

        let horisontalSpeed = Math.sqrt((this.player.getPlayer().field_70165_t-this.player.getPlayer().field_70142_S)**2+(this.player.getPlayer().field_70161_v-this.player.getPlayer().field_70136_U)**2)

        let verticleSpeed = this.player.getPlayer().field_70163_u-this.player.getPlayer().field_70137_T
        
        this.animOffset += Math.min(1, horisontalSpeed)*10*timeSince+1*timeSince

        let flapAmountMultiplyerNoEnd = 1
        let flapAmountMultiplyer = 1

        let wingEndOffsetThing = 0
        
        flapAmountMultiplyerNoEnd += Math.min(5, (horisontalSpeed*5))
        let flapMainOffsetThing = 0

        let wingBackAmount = 0

        if(this.player.getPlayer().field_70172_ad > 0){ //damage tick
            this.animOffset += 5*timeSince
        }


        // if((this.player === Player &&this.player.getPlayer().field_71075_bZ.field_75100_b) || (this.player !== Player && Math.abs(verticleSpeed)<0.2 && !this.player.getPlayer().field_70122_E)){//playerCapabilities.isFlying
        if((verticleSpeed>-0.2) && !this.player.getPlayer().field_70122_E){ //flying
            
            if(this.animOffset-this.lastFlapSound > 2*Math.PI){

                let dist = Math.sqrt((Player.getX()-this.player.getX())**2+(Player.getY()-this.player.getY())**2+(Player.getZ()-this.player.getZ())**2)+1

                World.playSound("mob.enderdragon.wings", (this.settings.scale*15)*Math.min(1, 50/(dist*dist)), 1)
                this.lastFlapSound = this.animOffset-this.animOffset%(Math.PI*2)
            }

            this.animOffset += 5*timeSince //flap in mid air

            flapAmountMultiplyer *= 1.75 //flap harder

            if(this.player === Player && Client.getMinecraft().field_71474_y.field_74320_O === 0){
                if(!this.parent.lessFirstPersonVisable.getValue()){
                    flapAmountMultiplyerNoEnd += 0.4
                    flapMainOffsetThing = 0.3
                }
            }else{
                flapAmountMultiplyer *= 1.25
                flapAmountMultiplyer *= 0.9
                flapMainOffsetThing = 0.1
                wingEndOffsetThing+= -0.1
            }

            wingEndOffsetThing += -0.75

            if(verticleSpeed > 0){
                this.animOffset += verticleSpeed*25*timeSince //flap when flying upwards
            }
        }else{
            if(this.lastFlapSound < this.animOffset-this.animOffset%(Math.PI*2)){
                this.lastFlapSound = this.animOffset-this.animOffset%(Math.PI*2)
            }
        }
        if(verticleSpeed < -0.5){
            wingBackAmount = Math.min(1, (verticleSpeed+0.5)*-1.5) //lift wings back further ur falling

            this.animOffset += (verticleSpeed+0.5)*-3*timeSince
        }

        GlStateManager.func_179094_E(); // pushMatrix

        if(this.player !== Player){
            Tessellator.translate(
                (this.player.getPlayer().field_70142_S + (this.player.getPlayer().field_70165_t-this.player.getPlayer().field_70142_S) * ticks) - (Player.getPlayer().field_70142_S + (Player.getPlayer().field_70165_t-Player.getPlayer().field_70142_S) * ticks),
                (this.player.getPlayer().field_70137_T + (this.player.getPlayer().field_70163_u-this.player.getPlayer().field_70137_T) * ticks) - (Player.getPlayer().field_70137_T + (Player.getPlayer().field_70163_u-Player.getPlayer().field_70137_T) * ticks),
                (this.player.getPlayer().field_70136_U + (this.player.getPlayer().field_70161_v-this.player.getPlayer().field_70136_U) * ticks) - (Player.getPlayer().field_70136_U + (Player.getPlayer().field_70161_v-Player.getPlayer().field_70136_U) * ticks))
        }

        Client.getMinecraft().field_71446_o.func_110577_a(textures) //bind texture

        if(this.player.getPlayer().field_70154_o){
            rotation = this.player.getPlayer().field_70759_as+(this.player.getPlayer().field_70759_as-this.player.getPlayer().field_70758_at)*ticks
        }
        if(!this.player.getPlayer().func_70608_bn()){  //dont rotate when in bed
            Tessellator.rotate((180-rotation),0,1,0)

            Tessellator.translate(0,1.2,0.1)
    
            if(this.player.getPlayer().func_70093_af()){ //isSneaking
                Tessellator.translate(0, -0.125,0)
                Tessellator.rotate(-20, 1,0,0)
                if(this.player === Player && Client.getMinecraft().field_71474_y.field_74320_O === 0){}else{
                    Tessellator.translate(0, -0.125,0)
                }
            }
    
            if(this.player === Player && Client.getMinecraft().field_71474_y.field_74320_O === 0){
                //Make wings less scuffed when in first person looking down/up
                Tessellator.translate(0, 0.25, 0.003*(this.player.getPitch()))
            }
        }


        //Higher = more elytra like
        wing.field_78796_g = 0.25; //rotateAngleY

        let shouldStandingStillWingThing = false

        let changeStandingStillWingThing = 0

        if(horisontalSpeed < 0.01){
            if(!((verticleSpeed>-0.2) && !this.player.getPlayer().field_70122_E)){ //not flying
                let amt = (this.animOffset+Math.PI/2)%(20*Math.PI)
                if(amt < 1*Math.PI){
                    if(amt > 0.65*Math.PI && (2*Math.PI+this.animOffset)-this.lastFlapSound > 2*Math.PI){
        
                        let dist = Math.sqrt((Player.getX()-this.player.getX())**2+(Player.getY()-this.player.getY())**2+(Player.getZ()-this.player.getZ())**2)+1
        
                        World.playSound("mob.enderdragon.wings", (this.settings.scale*15)*Math.min(1, 50/(dist*dist)), 1)
                        this.lastFlapSound = 2*Math.PI+(this.animOffset)-this.animOffset%(Math.PI*2)
                    }
                    this.animOffset += 2*timeSince*Math.min(1,(amt/(1*Math.PI))*2)

                    flapAmountMultiplyer += (amt/(1*Math.PI))/2
                }else if(amt < 2*Math.PI){
                    this.animOffset += 2*timeSince*Math.min(1,(1-(amt/(1*Math.PI)-1))*2)

                    flapAmountMultiplyer += (1-(amt/(1*Math.PI)-1))/2
                }
            }
            if(this.player.getPlayer().func_70093_af()){ //isSneaking
                if(this.player.getPlayer().field_70125_A > 20){
                    shouldStandingStillWingThing = true
                    Tessellator.translate(0, 0,0.1)
                    changeStandingStillWingThing =  Math.max(0,this.player.getPlayer().field_70125_A/600)
                }
            }
        }

        if(shouldStandingStillWingThing){
            wing.field_78796_g = 0.25+(changeStandingStillWingThing)*3
        }

        if(this.player.getPlayer().func_70608_bn()){ //player in bed

            try{ //try catch incase no bed at that location
                let facing = World.getWorld().func_180495_p(this.player.getPlayer().field_71081_bT).func_177229_b(FACING).func_176736_b() //0-3 is S-W-N-E

                let rotation = 0
                switch(facing){
                    case 0:
                        rotation = 180
                        Tessellator.translate(0, 0,-0.5)
                        break
                    case 1:
                        rotation = 90
                        Tessellator.translate(0.5, 0,0)
                        break
                    case 2:
                        rotation = 0
                        Tessellator.translate(0, 0,0.5)
                        break
                    case 3:
                        rotation = 270
                        Tessellator.translate(-0.5, 0,0)
                        break
                }
                // console.log(rotation)
                // console.log(World.getBlockAt(this.player.getX(), this.player.getY(), this.player.getZ()).getState().func_177229_b(FACING))
                Tessellator.translate(0, 0.75-this.settings.scale*100,0)
                Tessellator.rotate(rotation, 0, 1, 0)

                wing.field_78795_f = 0; //rotateAngleX

                wing.field_78808_h = (-0.5+Math.sin(this.animOffset/5)*0.1)*this.settings.scale*100; //rotateAngleZ

                
                wingTip.field_78808_h = -2.20+Math.sin(this.animOffset/5)*0.1
            }catch(e){}
        }else if(wingBackAmount === 0){
            //tilt
            let wing_tilt_offset = -Math.min(0.8, horisontalSpeed*3) //When go faster tilt wing back so its in direction of wind

            
            if(shouldStandingStillWingThing){
                wing_tilt_offset += (changeStandingStillWingThing)*4
            }

            wing.field_78795_f = 0.75 - Math.cos(this.animOffset) * 0.2+wing_tilt_offset; //rotateAngleX


            let wing_goback_amount = 0.15/(Math.min(1, horisontalSpeed)*3+0.25)
            let temp_wing_thing = 1

            if(shouldStandingStillWingThing){
                wing_goback_amount /= 1+(changeStandingStillWingThing)/50
                flapAmountMultiplyer /= 1+(changeStandingStillWingThing)/50

                temp_wing_thing += changeStandingStillWingThing*50
            }

            let temp_horis_wingthing = 0
            if(shouldStandingStillWingThing){
                temp_horis_wingthing = -(changeStandingStillWingThing)*0.75
            }

            wing.field_78808_h = (Math.sin(this.animOffset)/temp_wing_thing + 0.125) * wing_goback_amount*(1+(flapAmountMultiplyer-1)*1)*flapAmountMultiplyerNoEnd -0.4-wing_tilt_offset/3+temp_horis_wingthing+flapMainOffsetThing; //rotateAngleZ

            
            wingTip.field_78808_h = -((Math.sin((this.animOffset+1.5+(1-temp_wing_thing)/8.5))/(1+(temp_wing_thing-1)/3) + 0.5)) * 0.75*(1+(flapAmountMultiplyer-1)*1)/(1+temp_horis_wingthing) -  (1-flapAmountMultiplyer)*2-(1-temp_wing_thing)/10+wingEndOffsetThing; //rotateAngleZ
        }else{
            //tilt
            let wing_tilt_offset = -Math.min(0.8, horisontalSpeed*3) //When go faster tilt wing back so its in direction of wind
            wing.field_78795_f = 0.75 - Math.cos(this.animOffset) * 0.2+wing_tilt_offset-wingBackAmount/2; //rotateAngleX


            wing.field_78808_h = -wingBackAmount; //rotateAngleZ

            
            wingTip.field_78808_h = -((Math.sin((this.animOffset))*0.5 + 0.3))
        }
        

        Tessellator.translate(0.1, 0, 0)
        wing.func_78791_b(this.settings.scale) //render left wing

        Tessellator.translate(-0.2, 0, 0)
        Tessellator.scale(-1, 1, 1)
        wing.func_78791_b(this.settings.scale) //render right wing
        
        
        GlStateManager.func_179121_F(); // popMatrix
    }

    onTick(){
        // this.scale += 0.001
    }
}

export default DragonWings;


function getField(e, field){
    
    let field2 = e.class.getDeclaredField(field);
            
    field2.setAccessible(true)

    return field2.get(e)
}