import javax.script.*;
import java.io.FileReader;
import net.canarymod.api.inventory.ItemType;

public class jscript
{
    public static void main(String[] args) throws Exception
    {
        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript");
        String fileName = args[0];
        java.io.File file = new java.io.File(fileName);
        engine.put("engine",engine);
        engine.put("args",args);
	try { 
	    engine.put("cmItemTypeClass",Class.forName("net.canarymod.api.inventroy.ItemType"));
	}catch(Exception e){
	}
        FileReader fr = new java.io.FileReader(file);
        ScriptContext ctx = engine.getContext();
        ctx.setAttribute(ScriptEngine.FILENAME, fileName, ScriptContext.ENGINE_SCOPE);
        engine.eval(fr,ctx);
        fr.close();
    }
}
