extern crate yew;
extern crate led_strip_web;

use yew::prelude::*;
use led_strip_web::Model;

fn main() {
    yew::initialize();
    App::<Model>::new().mount_to_body();
    yew::run_loop();
}
