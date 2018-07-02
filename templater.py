from jinja2 import Environment, FileSystemLoader, select_autoescape
import os
def render_templates():
    env = Environment(
        loader=FileSystemLoader('.'),
        autoescape=select_autoescape(['html', 'xml'])
    )

    templates_to_render = [ i for i in os.listdir() if i.endswith('html')]

    for i in templates_to_render:
        filename = '{0}'.format(i)
        template = env.get_template(filename)
        rendered = template.render()

        print('Jinja rendering: {0}'.format(filename))
        output_path = 'dist/{0}'.format(filename)
        with open(output_path, 'w', encoding='utf8') as f:
            f.write(rendered)

    print('RENDERING DONE')


render_templates()