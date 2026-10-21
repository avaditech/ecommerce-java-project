from flask import render_template
from flask import Flask

app = Flask(__name__, template_folder='template', static_folder='template', static_url_path='')


@app.route('/')
def home():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)