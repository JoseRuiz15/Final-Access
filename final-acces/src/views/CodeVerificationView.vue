<template>
    <section id="code-screen" class="relative">
            <!--fondo codigo-->
            <img src="/img/sesion.png" alt="pantalla de login" 
            class="absolute inset-0 w-full h-full object-cover" />
            <!--cuadro de verificacion de codigo-->
             <div class="relative z-10 flex items-center justify-center min-h-screen">
                <div class="w-[550px] h-[550px]
                    rounded-3xl
                    bg-[#14172C]">
                    <!--textos-->
                 <p class="text-[#A55CCF] font-pixel text-3xl text-center mt-10">VERIFICACION DE CORREO</p>

                 <p class="text-1xl text-white font-pixel text-center">Hemos enviado un codigo de verificaciona tu correoelectronico</p>
                 <!--revicion del correo-->
                 <div class="bg-[#2D304B] flex items-center justify-center mt-5 w-[500px] h-[40px] rounded-lg ml-[20px]">
                    <p class="text-white font-pixel text-[12px]">slen*******@gmail.com</p>
                    <!--boton que regresa la inicio-->
                    <button class="text-[#47FB3E] text-[8px] font-pixel ml-[100px]">¿No es tu correo?</button>
                 </div>
                 <!--texto-->
                 <p class="text-white text-1xl font-pixel text-center mt-[20px]">Introduce el codigo</p>
                 <!--donde colocar el codigo-->
                 <div class="flex items-center justify-center">
                    <!--cajas donde se colocan los numeros-->
                    <div class="rounded-lg border border-[#333553] border-4 mt-[20px]">
                        <input type="text" class="bg-[#14182D] text-white font-pixel text-center w-[50px] h-[50px] ">
                    </div>
                    <div class="rounded-lg border border-[#333553] border-4 mt-[20px]">
                        <input type="text" class="bg-[#14182D] text-white font-pixel text-center w-[50px] h-[50px]">
                    </div>
                    <div class="rounded-lg border border-[#333553] border-4 mt-[20px]">
                        <input type="text" class="bg-[#14182D] text-white font-pixel text-center w-[50px] h-[50px]">
                    </div>
                    <div class="rounded-lg border border-[#333553] border-4 mt-[20px]">
                        <input type="text" class="bg-[#14182D] text-white font-pixel text-center w-[50px] h-[50px]">
                    </div>
                    <div class="rounded-lg border border-[#333553] border-4 mt-[20px]">
                        <input type="text" class="bg-[#14182D] text-white font-pixel text-center w-[50px] h-[50px]">
                    </div>
                    <div class="rounded-lg border border-[#333553] border-4 mt-[20px]">
                        <input type="text" class="bg-[#14182D] text-white font-pixel text-center w-[50px] h-[50px]">
                    </div>
                    
                 </div>

                </div>
             </div>

          </section>
</template>

<!--NOTA: AGREGAR LO QUE HACE FALTA EN EL CUADRO DE VERIFICACIOND DE CODIGO, LOS BOTONES DE VERIFICAR Y REENVIAR, EL TIEMPO Y TRATAR DE HACER TODO LO MAS IGUAL POSIBLE AL FIGMA-->