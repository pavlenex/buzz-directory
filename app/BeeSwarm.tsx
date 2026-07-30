"use client";

import { useEffect, useRef } from "react";

const vertexShaderSource = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform float u_time;
  uniform float u_bee_count;

  float hash(float value) {
    return fract(sin(value * 127.1) * 43758.5453123);
  }

  mat2 rotate2d(float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat2(cosine, -sine, sine, cosine);
  }

  float ellipse(vec2 point, vec2 radius) {
    return (length(point / radius) - 1.0) * min(radius.x, radius.y);
  }

  void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 field = gl_FragCoord.xy / u_resolution - 0.5;
    field.x *= aspect;

    vec2 pointer = u_pointer - 0.5;
    pointer.x *= aspect;

    vec3 color = vec3(0.0);
    float opacity = 0.0;

    for (int index = 0; index < 30; index++) {
      float beeIndex = float(index);
      if (beeIndex >= u_bee_count) {
        continue;
      }

      float seed = hash(beeIndex + 3.7);
      vec2 home = vec2(
        (hash(beeIndex * 2.17 + 8.0) - 0.5) * aspect * 1.08,
        (hash(beeIndex * 4.73 + 2.0) - 0.5) * 0.94
      );

      float phase = u_time * (0.48 + seed * 0.42) + seed * 18.0;
      float attraction = 0.34 + 0.28 * sin(seed * 9.0 + u_time * 0.22);
      vec2 orbit = vec2(
        cos(phase * (0.82 + seed * 0.31)),
        sin(phase * (1.06 + seed * 0.24))
      );
      orbit *= vec2(0.075 + seed * 0.13, 0.055 + seed * 0.09);

      vec2 center = mix(home, pointer, attraction) + orbit;
      center += vec2(
        sin(u_time * 1.8 + seed * 31.0),
        cos(u_time * 1.45 + seed * 23.0)
      ) * 0.012;

      vec2 movement = pointer - center;
      float angle = atan(movement.y, movement.x) + sin(phase * 1.7) * 0.24;
      float scale = 0.0105 + seed * 0.0085;
      vec2 bee = rotate2d(-angle) * (field - center) / scale;

      float body = smoothstep(0.10, -0.04, ellipse(bee, vec2(1.0, 0.54)));
      float head = smoothstep(0.10, -0.04, ellipse(bee - vec2(0.78, 0.0), vec2(0.43)));

      vec2 upperWingPoint = rotate2d(-0.48) * (bee - vec2(-0.12, 0.54));
      vec2 lowerWingPoint = rotate2d(0.48) * (bee - vec2(-0.12, -0.54));
      float upperWing = smoothstep(
        0.09,
        -0.05,
        ellipse(upperWingPoint, vec2(0.58, 0.27))
      );
      float lowerWing = smoothstep(
        0.09,
        -0.05,
        ellipse(lowerWingPoint, vec2(0.58, 0.27))
      );
      float wings = max(upperWing, lowerWing) * (1.0 - body * 0.72);

      float stripeOne = smoothstep(0.19, 0.07, abs(bee.x + 0.25));
      float stripeTwo = smoothstep(0.18, 0.07, abs(bee.x - 0.27));
      float stripes = max(stripeOne, stripeTwo) * body;
      float eye = smoothstep(0.08, 0.01, length(bee - vec2(1.02, 0.13)));

      vec3 beeColor = vec3(0.0);
      beeColor = mix(beeColor, vec3(1.0, 0.99, 0.88), wings * 0.68);
      beeColor = mix(beeColor, vec3(0.97, 1.0, 0.0), body);
      beeColor = mix(
        beeColor,
        vec3(0.055, 0.06, 0.045),
        max(max(stripes, head), eye)
      );

      float beeOpacity = max(max(body, head), wings * 0.7);
      float available = beeOpacity * (1.0 - opacity);
      color = mix(color, beeColor, available);
      opacity += available;
    }

    gl_FragColor = vec4(color, opacity * 0.92);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function BeeSwarm() {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>(".hero");
    const gl = canvas?.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });

    if (!shell || !canvas || !hero || !gl) return;

    const vertexShader = compileShader(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSource,
    );
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const position = gl.getAttribLocation(program, "a_position");
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const pointer = gl.getUniformLocation(program, "u_pointer");
    const time = gl.getUniformLocation(program, "u_time");
    const beeCount = gl.getUniformLocation(program, "u_bee_count");
    const buffer = gl.createBuffer();
    if (!buffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.useProgram(program);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    shell.dataset.ready = "true";

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const targetPointer = { x: 0.52, y: 0.55 };
    const smoothPointer = { ...targetPointer };
    let visible = true;
    let frame = 0;
    let startTime = performance.now();

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        coarsePointer ? 1 : 1.25,
      );
      const width = Math.max(1, Math.floor(rect.width * pixelRatio));
      const height = Math.max(1, Math.floor(rect.height * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const movePointer = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      targetPointer.x = (event.clientX - rect.left) / rect.width;
      targetPointer.y = 1 - (event.clientY - rect.top) / rect.height;
    };

    const draw = (now: number) => {
      smoothPointer.x += (targetPointer.x - smoothPointer.x) * 0.075;
      smoothPointer.y += (targetPointer.y - smoothPointer.y) * 0.075;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointer, smoothPointer.x, smoothPointer.y);
      gl.uniform1f(time, (now - startTime) / 1000);
      gl.uniform1f(beeCount, coarsePointer ? 18 : 30);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!reducedMotion && visible && !document.hidden) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      const nextVisible = entry.isIntersecting;
      if (nextVisible && !visible && !reducedMotion) {
        visible = true;
        startTime = performance.now();
        frame = window.requestAnimationFrame(draw);
      } else {
        visible = nextVisible;
        if (!visible) window.cancelAnimationFrame(frame);
      }
    });

    const onVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
      } else if (visible && !reducedMotion) {
        startTime = performance.now();
        frame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw(performance.now());

    observer.observe(hero);
    hero.addEventListener("pointermove", movePointer, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      hero.removeEventListener("pointermove", movePointer);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.cancelAnimationFrame(frame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="bee-swarm" ref={shellRef} aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="bee-fallback">
        {Array.from({ length: 10 }, (_, index) => (
          <span key={index}>🐝</span>
        ))}
      </div>
    </div>
  );
}
